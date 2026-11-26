import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '../../../common/repositories/base-mongo.repository';
import { CarBulbSpec, CarBulbSpecDocument } from '../schemas/car-bulb-spec.schema';
import { ICarRepository } from '../interfaces/car-repository.interface';
import { SocketType } from '../../products/schemas/product.schema';
import { escapeRegExp } from '../../../common/utils/escape-regexp';

@Injectable()
export class CarRepository
  extends BaseMongoRepository<CarBulbSpec, CarBulbSpecDocument>
  implements ICarRepository
{
  constructor(
    @InjectModel(CarBulbSpec.name)
    private readonly carModelDoc: Model<CarBulbSpecDocument>,
  ) {
    super(carModelDoc);
  }

  async getAllMakes(): Promise<string[]> {
    const makes = await this.carModelDoc.distinct('carMake').exec();
    return (makes as string[]).sort();
  }

  async findByMake(carMake: string): Promise<CarBulbSpec[]> {
    return this.carModelDoc
      .find({ carMake: new RegExp(`^${escapeRegExp(carMake)}$`, 'i') })
      .sort({ carModel: 1 })
      .lean<CarBulbSpec[]>()
      .exec();
  }

  async findSpec(carMake: string, carModel: string): Promise<CarBulbSpec | null> {
    return this.carModelDoc
      .findOne({
        carMake: new RegExp(`^${escapeRegExp(carMake)}$`, 'i'),
        carModel: new RegExp(`^${escapeRegExp(carModel)}$`, 'i'),
      })
      .lean<CarBulbSpec>()
      .exec();
  }

  async findBySocket(socket: SocketType): Promise<CarBulbSpec[]> {
    return this.carModelDoc
      .find({
        $or: [{ lowBeam: socket }, { highBeam: socket }, { fogLight: socket }],
      })
      .lean<CarBulbSpec[]>()
      .exec();
  }

  async searchCars(query: string): Promise<CarBulbSpec[]> {
    const reg = new RegExp(escapeRegExp(query.slice(0, 100)), 'i');
    return this.carModelDoc
      .find({
        $or: [{ carMake: reg }, { carModel: reg }, { notes: reg }],
      })
      .limit(15)
      .lean<CarBulbSpec[]>()
      .exec();
  }
}
