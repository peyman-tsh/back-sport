import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { SocketType } from '../../products/schemas/product.schema';

export type CarBulbSpecDocument = HydratedDocument<CarBulbSpec>;

@Schema({
  timestamps: true,
  collection: 'car_bulb_specs',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class CarBulbSpec {
  id?: string;

  @Prop({ required: true, trim: true, index: true })
  carMake: string; // e.g. ایران خودرو، سایپا، بهمن موتور، فونیکس، هیوندای

  @Prop({ required: true, trim: true, index: true })
  carModel: string; // e.g. ری‌را (Reera)، دنا پلاس، سهند، تیگو 8 پرو

  @Prop({ default: 'تمام مدل‌ها' })
  yearRange: string;

 @Prop({
  type: String,
  required: true,
  enum: ['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'],
})
lowBeam: SocketType;

@Prop({
  type: String,
  required: true,
  enum: ['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'],
})
highBeam: SocketType;

@Prop({
  type: String,
  enum: ['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'],
})
fogLight?: SocketType;

  @Prop()
  notes?: string;

  @Prop({ default: true })
  requiresCanbus: boolean; // آیا سیستم مالتی‌پلکس نیازمند کن‌باس دارد
}

export const CarBulbSpecSchema = SchemaFactory.createForClass(CarBulbSpec);

CarBulbSpecSchema.index({ carMake: 1, carModel: 1 }, { unique: true });
CarBulbSpecSchema.index({ lowBeam: 1 });
CarBulbSpecSchema.index({ highBeam: 1 });
CarBulbSpecSchema.index({ fogLight: 1 });
