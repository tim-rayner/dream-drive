import { ICarAliasRepository } from '../../domain/interfaces/car-alias.repo';
import { ICarModelRepository } from '../../domain/interfaces/car-model.repo';
import {
  normalizeMake,
  normalizeModel,
} from '../../domain/services/normalization.service';

export class ResolveCarUseCase {
  constructor(
    private readonly aliases: ICarAliasRepository,
    private readonly models: ICarModelRepository
  ) {}

  async execute(q: {
    make: string;
    model: string;
    year?: number;
    engineCode?: string;
  }) {
    const make = normalizeMake(q.make);
    const model = normalizeModel(q.model);

    const alias = await this.aliases.resolveAlias(
      make,
      model,
      q.year,
      q.engineCode
    );
    if (alias) {
      const car = await this.models.findById(alias.carModelId);
      return car ?? null;
    }
    return this.models.findCanonical(make, model);
  }
}
