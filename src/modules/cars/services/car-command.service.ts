import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { ICarRepository } from '../interfaces/car-repository.interface';
import { CreateCarSpecDto } from '../dto/create-car-spec.dto';
import { CarBulbSpec } from '../schemas/car-bulb-spec.schema';

/**
 * Single Responsibility Principle (SRP):
 * CarCommandService is responsible for adding/editing car bulb specs.
 */
@Injectable()
export class CarCommandService {
  constructor(
    @Inject(INJECTION_TOKENS.CAR_REPOSITORY)
    private readonly carRepository: ICarRepository,
  ) {}

  async createSpec(dto: CreateCarSpecDto): Promise<CarBulbSpec> {
    const existing = await this.carRepository.findSpec(dto.carMake, dto.carModel);
    if (existing) {
      throw new ConflictException(
        `مشخصات خودروی "${dto.carMake} ${dto.carModel}" قبلاً در سیستم ثبت شده است.`,
      );
    }

    return this.carRepository.create(dto);
  }

  async updateSpec(id: string, dto: Partial<CreateCarSpecDto>): Promise<CarBulbSpec> {
    const existing = await this.carRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('خودروی مورد نظر یافت نشد.');
    }

    const updated = await this.carRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('خطا در به‌روزرسانی مشخصات خودرو');
    }
    return updated;
  }

  async deleteSpec(id: string): Promise<boolean> {
    const existing = await this.carRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('خودرو یافت نشد.');
    }
    return this.carRepository.delete(id);
  }
}
