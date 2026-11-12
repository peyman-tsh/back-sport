import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

@Schema({
  timestamps: true,
  collection: 'coupons',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Coupon {
  id?: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code: string;

  @Prop({ required: true, enum: ['PERCENTAGE', 'FIXED_AMOUNT'] })
  discountType: DiscountType;

  @Prop({ required: true, min: 1 })
  value: number; // درصد تخفیف (مثلا 15) یا مبلغ ثابت به تومان (مثلا 200,000)

  @Prop({ default: 0 })
  minOrderAmount: number; // حداقل مبلغ سفارش

  @Prop()
  maxDiscountAmount?: number; // سقف تخفیف برای درصدی

  @Prop()
  expiresAt?: Date;

  @Prop({ default: 100 })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.index({ code: 1, isActive: 1 });
