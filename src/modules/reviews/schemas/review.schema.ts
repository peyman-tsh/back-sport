import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  timestamps: true,
  collection: 'reviews',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Review {
  id?: string;

  @Prop({ required: true, index: true })
  productId: string;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ trim: true })
  carModel?: string; // e.g. نصب شده روی پژو 206 نور پایین

  @Prop({ required: true, min: 1, max: 5 })
  rating: number; // کلی

  @Prop({ min: 1, max: 5, default: 5 })
  cutOffLineScore: number; // دقت خط کات استاندارد بدون کوری دید

  @Prop({ min: 1, max: 5, default: 5 })
  beamThrowScore: number; // پرتاب نور جاده‌ای

  @Prop({ min: 1, max: 5, default: 5 })
  fanNoiseScore: number; // بی‌صدایی فن

  @Prop({ required: true })
  comment: string;

  @Prop([String])
  advantages?: string[]; // نکات مثبت: پرتاب نور عالی، کات دقیق

  @Prop([String])
  disadvantages?: string[]; // نکات منفی

  @Prop({ default: true })
  isVerifiedBuyer: boolean;

  @Prop({ default: true, index: true })
  isApproved: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });
