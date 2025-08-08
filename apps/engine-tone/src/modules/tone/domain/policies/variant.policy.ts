import { Sound } from '../entities/sound.entity';

export const rankSounds = (list: Sound[]) =>
  [...list].sort((a, b) => b.qualityScore() - a.qualityScore());
