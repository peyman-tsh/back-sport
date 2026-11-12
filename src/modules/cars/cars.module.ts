import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarBulbSpec, CarBulbSpecSchema } from './schemas/car-bulb-spec.schema';
import { CarController } from './controllers/car.controller';
import { CarQueryService } from './services/car-query.service';
import { CarCommandService } from './services/car-command.service';
import { CarRepository } from './repositories/car.repository';
import { INJECTION_TOKENS } from '../../common/constants/tokens';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CarBulbSpec.name, schema: CarBulbSpecSchema },
    ]),
  ],
  controllers: [CarController],
  providers: [
    CarQueryService,
    CarCommandService,
    {
      provide: INJECTION_TOKENS.CAR_REPOSITORY,
      useClass: CarRepository,
    },
  ],
  exports: [CarQueryService, CarCommandService, INJECTION_TOKENS.CAR_REPOSITORY],
})
export class CarsModule {}
