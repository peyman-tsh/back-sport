import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { ShippingAddress, ShippingAddressSchema } from '../../orders/schemas/order.schema';

export type UserDocument = HydratedDocument<User>;

export type UserRole = 'CUSTOMER' | 'ADMIN';

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      delete ret.passwordHash;
      return ret;
    },
  },
})
export class User {
  id?: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  phoneNumber: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER', index: true })
  role: UserRole;

  @Prop({ type: [ShippingAddressSchema], default: [] })
  savedAddresses: ShippingAddress[];

  @Prop({ type: [String], default: [] })
  favoriteProductIds: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { sparse: true });
