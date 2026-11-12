import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export type SocketType = 'H1' | 'H3' | 'H4' | 'H7' | 'H11' | 'H16' | '9005' | '9006' | '880' | 'D2S';

export type SportCategory =
  | 'روشنایی و هدلایت'
  | 'کیت بدنه و آیرودینامیک'
  | 'سیستم اگزوز و مکش'
  | 'سیستم تعلیق و فنربندی'
  | 'تزئینات و کابین اسپرت';

@Schema({ _id: false })
export class CarCompatibility {
  @Prop({ required: true, index: true })
  carMake: string; // e.g. ایران خودرو، سایپا، هیوندای، تویوتا

  @Prop({ required: true, index: true })
  carModel: string; // e.g. پژو 206، پژو پارس، دنا پلاس، کوییک، شاهین

  @Prop({ default: 'نصب فابریک' })
  position?: string; // e.g. نور پایین، سپر جلو، منیفولد دود، کمک جلو
}

export const CarCompatibilitySchema = SchemaFactory.createForClass(CarCompatibility);

@Schema({ _id: false })
export class ProductSeo {
  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop([String])
  keywords?: string[];
}

export const ProductSeoSchema = SchemaFactory.createForClass(ProductSeo);

@Schema({ _id: false })
export class SoundClip {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  mode: string; // e.g. سایلنسر باز، سایلنسر بسته، شتاب و کات‌آف، غرش مکش

  @Prop()
  carModel?: string; // e.g. موتور TU5 - پژو ۲۰۶

  @Prop()
  audioUrl?: string;

  @Prop({ default: 15 })
  durationSeconds?: number;

  @Prop({ default: 5000 })
  engineRpm?: number;

  @Prop({ default: 'exhaust' })
  soundType?: string; // exhaust | intake | blowoff | engine
}

export const SoundClipSchema = SchemaFactory.createForClass(SoundClip);

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'products',
})
export class Product {
  id?: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, index: true })
  brand: string; // e.g. HKS, Conpex, K&N, KDS, Momo, OMP, Sparco

  @Prop({
    required: true,
    index: true,
    trim: true,
  })
  category: string;

  @Prop({
    enum: ['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'],
    index: true,
  })
  socketType?: SocketType;

  @Prop({ required: true, min: 0, index: true })
  price: number; // Toman

  @Prop({ min: 0 })
  originalPrice?: number;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ min: 0, default: 0 })
  reservedStock: number;

  @Prop({ default: true, index: true })
  isAvailable: boolean;

  // Automotive Specs
  @Prop()
  material?: string; // e.g. فیبر کربن ۳K، استیل ضد زنگ ۳۰۴، آلومینیوم آلیاژی T6061

  @Prop()
  wattage?: number; // مخصوص دسته روشنایی

  @Prop()
  lumens?: number; // مخصوص دسته روشنایی

  @Prop()
  colorTemperature?: number; // مخصوص دسته روشنایی (3000K, 6000K, ...)

  @Prop()
  chipType?: string; // نوع چیپست یا سایلنسر

  @Prop({ default: 'تاییدیه استاندارد مسابقه‌ای و شهری' })
  coolingType?: string;

  @Prop({ default: true })
  hasCanbus: boolean;

  @Prop({ default: 12 })
  warrantyMonths: number;

  @Prop([String])
  images: string[];

  @Prop({ default: 5.0, min: 1, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  reviewsCount: number;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [CarCompatibilitySchema], default: [] })
  compatibility: CarCompatibility[];

  @Prop({ type: ProductSeoSchema })
  seo?: ProductSeo;

  @Prop({ type: [SoundClipSchema], default: [] })
  soundClips?: SoundClip[];

  @Prop()
  videoDemoUrl?: string;

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ default: false, index: true })
  isFeatured: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

/**
 * High-Performance MongoDB Indexes for Automotive Sport Store:
 */
ProductSchema.index({ category: 1, isAvailable: 1, price: 1 });
ProductSchema.index({ socketType: 1, isAvailable: 1 });
ProductSchema.index({ 'compatibility.carMake': 1, 'compatibility.carModel': 1 });
ProductSchema.index({ isFeatured: 1, createdAt: -1 });
ProductSchema.index(
  {
    title: 'text',
    brand: 'text',
    category: 'text',
    description: 'text',
    material: 'text',
    'compatibility.carModel': 'text',
  },
  {
    weights: {
      title: 10,
      category: 8,
      'compatibility.carModel': 7,
      brand: 5,
      material: 3,
      description: 2,
    },
    default_language: 'none',
  },
);
