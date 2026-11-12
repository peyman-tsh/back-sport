import { IRepository, IPaginatedResult, IPaginationOptions } from '../../../common/interfaces/repository.interface';
import { Order, OrderStatus } from '../schemas/order.schema';

export interface IOrderFilterCriteria {
  status?: OrderStatus;
  customerPhone?: string;
  startDate?: Date;
  endDate?: Date;
  orderNumber?: string;
}

export interface IOrderFinancialStats {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  averageOrderValue: number;
}

/**
 * Interface Segregation Principle (ISP):
 * High-level order repository contract decoupled from database implementation.
 */
export interface IOrderRepository extends IRepository<Order> {
  findFiltered(
    criteria: IOrderFilterCriteria,
    options?: IPaginationOptions,
  ): Promise<IPaginatedResult<Order>>;

  findByOrderNumber(orderNumber: string): Promise<Order | null>;

  findByTransactionRef(transactionRef: string): Promise<Order | null>;

  findByCustomerPhone(phone: string, limit?: number): Promise<Order[]>;

  updateStatus(
    orderNumber: string,
    status: OrderStatus,
    metadata?: { paymentRefId?: string; paidAt?: Date },
  ): Promise<Order | null>;

  getFinancialStats(): Promise<IOrderFinancialStats>;

  findExpiredReservedOrders(): Promise<Order[]>;
}
