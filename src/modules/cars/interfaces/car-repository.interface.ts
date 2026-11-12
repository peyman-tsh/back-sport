import { IRepository } from '../../../common/interfaces/repository.interface';
import { CarBulbSpec } from '../schemas/car-bulb-spec.schema';
import { SocketType } from '../../products/schemas/product.schema';

export interface ICarRepository extends IRepository<CarBulbSpec> {
  getAllMakes(): Promise<string[]>;
  findByMake(carMake: string): Promise<CarBulbSpec[]>;
  findSpec(carMake: string, carModel: string): Promise<CarBulbSpec | null>;
  findBySocket(socket: SocketType): Promise<CarBulbSpec[]>;
  searchCars(query: string): Promise<CarBulbSpec[]>;
}
