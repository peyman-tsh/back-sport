import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, ClientSession } from 'mongoose';
import { BaseMongoRepository } from '../../../common/repositories/base-mongo.repository';
import { Product, ProductDocument } from '../schemas/product.schema';
import {
  IProductRepository,
  IProductFilterCriteria,
  IAvailableFilterSummary,
} from '../interfaces/product-repository.interface';
import { IPaginatedResult, IPaginationOptions } from '../../../common/interfaces/repository.interface';
import { escapeRegExp } from '../../../common/utils/escape-regexp';

@Injectable()
export class ProductRepository
  extends BaseMongoRepository<Product, ProductDocument>
  implements IProductRepository
{
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.productModel.findOne({ slug }).lean<Product>().exec();
  }

  async findFiltered(
    criteria: IProductFilterCriteria,
    options: IPaginationOptions = {},
  ): Promise<IPaginatedResult<Product>> {
    const filter: FilterQuery<ProductDocument> = {};

    if (criteria.category) {
      filter.category = criteria.category;
    }

    if (criteria.socketType) {
      filter.socketType = criteria.socketType;
    }

    if (criteria.brand) {
      filter.brand = new RegExp(`^${escapeRegExp(criteria.brand)}$`, 'i');
    }

    if (criteria.material) {
      filter.material = new RegExp(escapeRegExp(criteria.material), 'i');
    }

    if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
      filter.price = {};
      if (criteria.minPrice !== undefined) filter.price.$gte = criteria.minPrice;
      if (criteria.maxPrice !== undefined) filter.price.$lte = criteria.maxPrice;
    }

    if (criteria.minLumens !== undefined) {
      filter.lumens = { $gte: criteria.minLumens };
    }

    if (criteria.minWattage !== undefined) {
      filter.wattage = { $gte: criteria.minWattage };
    }

    if (criteria.colorTemperature !== undefined) {
      filter.colorTemperature = criteria.colorTemperature;
    }

    if (criteria.inStockOnly) {
      filter.isAvailable = true;
      filter.stock = { $gt: 0 };
    }

    // Car compatibility filter
    if (criteria.carMake || criteria.carModel || criteria.position) {
      const elemMatch: Record<string, any> = {};
      if (criteria.carMake) elemMatch.carMake = new RegExp(escapeRegExp(criteria.carMake), 'i');
      if (criteria.carModel) elemMatch.carModel = new RegExp(escapeRegExp(criteria.carModel), 'i');
      if (criteria.position) elemMatch.position = new RegExp(escapeRegExp(criteria.position), 'i');

      filter.compatibility = { $elemMatch: elemMatch };
    }

    // Text search
    if (criteria.search) {
      filter.$text = { $search: criteria.search };
    }

    return this.findAll(filter, options);
  }

  async findByCarCompatibility(
    carMake: string,
    carModel: string,
    position?: string,
  ): Promise<Product[]> {
    const elemMatch: Record<string, any> = {
      carMake: new RegExp(escapeRegExp(carMake), 'i'),
      carModel: new RegExp(escapeRegExp(carModel), 'i'),
    };
    if (position) {
      elemMatch.position = new RegExp(escapeRegExp(position), 'i');
    }

    return this.productModel
      .find({
        compatibility: { $elemMatch: elemMatch },
        isAvailable: true,
      })
      .sort({ rating: -1, salesCount: -1 })
      .lean<Product[]>()
      .exec();
  }

  async findFeatured(limit = 8): Promise<Product[]> {
    return this.productModel
      .find({ isFeatured: true, isAvailable: true })
      .sort({ salesCount: -1, createdAt: -1 })
      .limit(limit)
      .lean<Product[]>()
      .exec();
  }

  async searchFast(keyword: string, limit = 10): Promise<Product[]> {
    return this.productModel
      .find({
        $text: { $search: keyword },
        isAvailable: true,
      })
      .select('title slug category socketType price images brand material')
      .limit(limit)
      .lean<Product[]>()
      .exec();
  }

  async getFilterFacetSummary(): Promise<IAvailableFilterSummary> {
    const [categoryFacets, brandFacets, socketFacets, priceStats] = await Promise.all([
      this.productModel.aggregate([
        { $match: { isAvailable: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.productModel.aggregate([
        { $match: { isAvailable: true } },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.productModel.aggregate([
        { $match: { isAvailable: true, socketType: { $exists: true, $ne: null } } },
        { $group: { _id: '$socketType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.productModel.aggregate([
        {
          $group: {
            _id: null,
            min: { $min: '$price' },
            max: { $max: '$price' },
          },
        },
      ]),
    ]);

    return {
      categories: categoryFacets.map((c) => ({ category: c._id, count: c.count })),
      brands: brandFacets.map((b) => ({ brand: b._id, count: b.count })),
      sockets: socketFacets.map((s) => ({ socket: s._id, count: s.count })),
      priceRange: {
        min: priceStats[0]?.min || 0,
        max: priceStats[0]?.max || 10000000,
      },
    };
  }

  async decrementStock(productId: string, quantity: number, session?: ClientSession): Promise<boolean> {
    const result = await this.productModel
      .updateOne(
        { _id: productId, stock: { $gte: quantity } },
        [
          { $set: {
            stock: { $subtract: ['$stock', quantity] },
            isAvailable: { $gt: [{ $subtract: ['$stock', quantity] }, 0] },
            salesCount: { $add: [{ $ifNull: ['$salesCount', 0] }, quantity] },
          } },
        ],
      )
      .session(session || null)
      .exec();

    return result.modifiedCount > 0;
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const result = await this.productModel
      .updateOne(
        { _id: productId, stock: { $gte: quantity } },
        [
          { $set: {
            stock: { $subtract: ['$stock', quantity] },
            isAvailable: { $gt: [{ $subtract: ['$stock', quantity] }, 0] },
            reservedStock: { $add: [{ $ifNull: ['$reservedStock', 0] }, quantity] },
          } },
        ],
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async releaseReservedStock(productId: string, quantity: number, session?: ClientSession): Promise<boolean> {
    const result = await this.productModel
      .updateOne(
        { _id: productId, reservedStock: { $gte: quantity } },
        {
          $inc: { stock: quantity, reservedStock: -quantity },
          $set: { isAvailable: true },
        },
      )
      .session(session || null)
      .exec();

    return result.modifiedCount > 0;
  }

  async finalizeReservedStock(productId: string, quantity: number, session?: ClientSession): Promise<boolean> {
    const result = await this.productModel
      .updateOne(
        { _id: productId, reservedStock: { $gte: quantity } },
        {
          $inc: { reservedStock: -quantity, salesCount: quantity },
        },
      )
      .session(session || null)
      .exec();

    return result.modifiedCount > 0;
  }

  async updateStock(productId: string, newStock: number): Promise<Product | null> {
    return this.productModel
      .findByIdAndUpdate(
        productId,
        {
          $set: {
            stock: newStock,
            isAvailable: newStock > 0,
          },
        },
        { new: true },
      )
      .lean<Product>()
      .exec();
  }

  async adjustStock(productId: string, delta: number): Promise<Product | null> {
    return this.productModel
      .findOneAndUpdate(
        { _id: productId, stock: { $gte: Math.max(0, -delta) } },
        [
          { $set: { stock: { $add: ['$stock', delta] } } },
          { $set: { isAvailable: { $gt: ['$stock', 0] } } },
        ],
        { new: true },
      )
      .lean<Product>()
      .exec();
  }
}
