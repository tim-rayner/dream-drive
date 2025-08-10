import { CarModel } from '../../../catalog/domain/entities/car-model.entity';

export interface ISearchHit<T> {
  item: T;
  confidence: number; // 0..1
}
export interface ISearchPort {
  fuzzyBest(
    make: string,
    model: string,
    all: CarModel[]
  ): ISearchHit<CarModel> | null;
}
