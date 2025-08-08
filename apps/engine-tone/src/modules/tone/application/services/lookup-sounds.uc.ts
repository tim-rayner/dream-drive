// modules/engine-tone/application/services/lookup-sounds.uc.ts
import { ResolveCarUseCase } from '../../../catalog/application/services/resolve-car.uc';
import { SoundVariant } from '../../domain/entities/sound.entity';
import { ICachePort } from '../../domain/interfaces/cache.port';
import { ISoundRepository } from '../../domain/interfaces/sound.repo';
import { IStoragePort } from '../../domain/interfaces/storage.port';

export class LookupSoundsUseCase {
  constructor(
    private readonly resolveCar: ResolveCarUseCase,
    private readonly sounds: ISoundRepository,
    private readonly storage: IStoragePort,
    private readonly cache: ICachePort
  ) {}

  async execute(q: {
    make: string;
    model: string;
    year?: number;
    engineCode?: string;
    variant?: SoundVariant;
  }) {
    const cacheKey = `enginetone:${JSON.stringify(q)}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const car = await this.resolveCar.execute(q);
    if (!car) throw new Error('engine-tone.notFound');

    const rows = await this.sounds.listByCarModel(car.id, q.variant);
    const files = await Promise.all(
      rows.map(async (r) => ({
        variant: r.variant,
        durationSec: r.durationSec,
        bitrateKbps: r.bitrateKbps,
        signedUrl: await this.storage.sign(r.objectKey, 3600),
        license: r.license,
        attribution: r.attribution,
      }))
    );

    const resp = {
      query: q,
      bestMatch: {
        make: car.make,
        model: car.model,
        yearFrom: car.yearFrom,
        yearTo: car.yearTo,
        engineCode: car.engineCode,
        confidence: 0.98,
      },
      files,
      _meta: { cacheTtlSec: 3600 },
    };
    await this.cache.set(cacheKey, resp, 3600);
    return resp;
  }
}
