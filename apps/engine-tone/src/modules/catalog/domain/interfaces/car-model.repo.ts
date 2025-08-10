import { CarModel } from '../entities/car-model.entity';

export interface ICarModelRepository {
  findCanonical(make: string, model: string): Promise<CarModel | null>;
  findById(id: string): Promise<CarModel | null>;
  listAll(): Promise<CarModel[]>;
}
