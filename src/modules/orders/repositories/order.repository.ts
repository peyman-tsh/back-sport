import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, ClientSession } from 'mongoose';
import { BaseMongoRepository } from '../../../common/repositories/base-mongo.repository';
import { Order, OrderDocument, OrderStatus } from '../schemas/order.schema';
import {
  IOrderRepository,
  IOrderFilterCriteria,
  IOrderFinancialStats,
} from '../interfaces/order-repository.interface';
import { IPaginatedResult, IPaginationOptions } from '../../../common/interfaces/repository.interface';
import { escapeRegExp } from '../../../common/utils/escape-regexp';

@Injectable()
export class OrderRepository
  extends BaseMongoRepository<Order, OrderDocument>
  implements IOrderRepository
{
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {
    super(orderModel);
  }

  async findFiltered(
    criteria: IOrderFilterCriteria,
    options: IPaginationOptions = {},
  ): Promise<IPaginatedResult<Order>> {
    const filter: FilterQuery<OrderDocument> = {};

    if (criteria.status) {
      filter.status = criteria.status;
    }

    if (criteria.customerPhone) {
      filter['shippingAddress.phoneNumber'] = new RegExp(escapeRegExp(criteria.customerPhone), 'i');
    }

    if (criteria.orderNumber) {
      filter.orderNumber = new RegExp(escapeRegExp(criteria.orderNumber), 'i');
    }

    if (criteria.startDate || criteria.endDate) {
      filter.createdAt = {};
      if (criteria.startDate) filter.createdAt.$gte = criteria.startDate;
      if (criteria.endDate) filter.createdAt.$lte = criteria.endDate;
    }

    return this.findAll(filter, options);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.orderModel.findOne({ orderNumber }).lean<Order>().exec();
  }

  async findByTransactionRef(transactionRef: string): Promise<Order | null> {
    return this.orderModel.findOne({ transactionRef }).lean<Order>().exec();
  }

  async findByCustomerPhone(phone: string, limit = 20): Promise<Order[]> {
    return this.orderModel
      .find({ 'shippingAddress.phoneNumber': phone })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<Order[]>()
      .exec();
  }

  async findByUserId(userId: string, limit = 20): Promise<Order[]> {
    return this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<Order[]>()
      .exec();
  }

  async markPaidIfPending(
    orderId: string,
    paymentRefId: string,
    paidAt: Date,
    session: ClientSession,
  ): Promise<boolean> {
    const result = await this.orderModel
      .updateOne(
        { _id: orderId, status: 'PENDING', isStockReserved: true },
        {
          $set: {
            status: 'PAID',
            isStockReserved: false,
            paymentRefId,
            paidAt,
          },
        },
        { session },
      )
      .exec();
    return result.modifiedCount === 1;
  }

  async expireReservationIfPending(orderId: string, session: ClientSession): Promise<Order | null> {
    return this.orderModel
      .findOneAndUpdate(
        {
          _id: orderId,
          status: 'PENDING',
          isStockReserved: true,
          expiresAt: { $lt: new Date() },
        },
        { $set: { status: 'EXPIRED', isStockReserved: false } },
        { new: false, session },
      )
      .lean<Order>()
      .exec();
  }

  async cancelIfPending(orderId: string, session: ClientSession): Promise<Order | null> {
    return this.orderModel
      .findOneAndUpdate(
        { _id: orderId, status: 'PENDING', isStockReserved: true },
        { $set: { status: 'CANCELLED', isStockReserved: false } },
        { new: false, session },
      )
      .lean<Order>()
      .exec();
  }

  async updateStatus(
    orderNumber: string,
    status: OrderStatus,
    expectedStatus?: OrderStatus,
    metadata: { paymentRefId?: string; paidAt?: Date } = {},
  ): Promise<Order | null> {
    const updatePayload: { status: OrderStatus; paymentRefId?: string; paidAt?: Date } = { status };
    if (metadata.paymentRefId) updatePayload.paymentRefId = metadata.paymentRefId;
    if (metadata.paidAt) updatePayload.paidAt = metadata.paidAt;

    return this.orderModel
      .findOneAndUpdate({ orderNumber, ...(expectedStatus ? { status: expectedStatus } : {}) }, { $set: updatePayload }, { new: true })
      .lean<Order>()
      .exec();
  }

  async getFinancialStats(): Promise<IOrderFinancialStats> {
    const [stats] = await this.orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, '$totalAmount', 0] },
          },
          totalOrders: { $sum: 1 },
          paidOrdersCount: {
            $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] },
          },
          pendingOrdersCount: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] },
          },
        },
      },
    ]);

    const totalRev = stats?.totalRevenue || 0;
    const paidCount = stats?.paidOrdersCount || 0;

    return {
      totalRevenue: totalRev,
      totalOrders: stats?.totalOrders || 0,
      paidOrdersCount: paidCount,
      pendingOrdersCount: stats?.pendingOrdersCount || 0,
      averageOrderValue: paidCount > 0 ? Math.round(totalRev / paidCount) : 0,
    };
  }

  async findExpiredReservedOrders(): Promise<Order[]> {
    return this.orderModel
      .find({
        status: 'PENDING',
        isStockReserved: true,
        expiresAt: { $lt: new Date() },
      })
      .lean<Order[]>()
      .exec();
  }
}
