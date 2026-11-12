import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { ICarRepository } from '../interfaces/car-repository.interface';
import { CarBulbSpec } from '../schemas/car-bulb-spec.schema';
import { SocketType } from '../../products/schemas/product.schema';

/**
 * Single Responsibility Principle (SRP):
 * CarQueryService handles looking up car bulb specifications.
 *
 * Dependency Inversion Principle (DIP):
 * Depends on ICarRepository abstraction token.
 */
@Injectable()
export class CarQueryService {
  constructor(
    @Inject(INJECTION_TOKENS.CAR_REPOSITORY)
    private readonly carRepository: ICarRepository,
  ) {}

  async getMakes(): Promise<string[]> {
    return this.carRepository.getAllMakes();
  }

  async getModelsByMake(make: string): Promise<CarBulbSpec[]> {
    return this.carRepository.findByMake(make);
  }

  async getSpec(make: string, model: string): Promise<CarBulbSpec> {
    const spec = await this.carRepository.findSpec(make, model);
    if (!spec) {
      throw new NotFoundException(`مشخصات پایه لامپ برای خودروی "${make} ${model}" یافت نشد.`);
    }
    return spec;
  }

  async getCarsBySocket(socket: SocketType): Promise<CarBulbSpec[]> {
    return this.carRepository.findBySocket(socket);
  }

  async search(query: string): Promise<CarBulbSpec[]> {
    if (!query || query.trim().length === 0) return [];
    return this.carRepository.searchCars(query.trim());
  }

  async getAll(): Promise<CarBulbSpec[]> {
    const result = await this.carRepository.findAll({}, { limit: 100 });
    return result.data;
  }
}
