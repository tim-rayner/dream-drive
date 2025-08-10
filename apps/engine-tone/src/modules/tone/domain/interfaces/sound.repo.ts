import { Sound, SoundVariant } from '../entities/sound.entity';

export interface ISoundRepository {
  listByCarModel(carModelId: string, variant?: SoundVariant): Promise<Sound[]>;
}
