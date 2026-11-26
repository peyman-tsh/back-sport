import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { SocketType } from '../../products/schemas/product.schema';

export type OrderDocument = HydratedDocument<Order>;

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'EXPIRED';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  title: string;

 @Prop({ type: String })
socketType: SocketType;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  totalPrice: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  postalAddress: string;

  @Prop({ required: true })
  postalCode: string;
}

export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({
  timestamps: true,
  collection: 'orders',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Order {
  id?: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true, index: true })
  orderNumber: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ default: 0 })
  shippingCost: number;

  @Prop({
    required: true,
    enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING',
    index: true,
  })
  status: OrderStatus;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: false, index: true })
  isStockReserved: boolean;

  @Prop()
  paymentGateway?: string;

  @Prop()
  transactionRef?: string;

  @Prop()
  paymentRefId?: string;

  @Prop()
  paidAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ 'shippingAddress.phoneNumber': 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
