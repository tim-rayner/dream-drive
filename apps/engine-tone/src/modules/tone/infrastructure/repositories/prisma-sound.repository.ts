import { PrismaClient } from '@prisma/client';
import { Sound, SoundVariant } from '../../domain/entities/sound.entity';
import { ISoundRepository } from '../../domain/interfaces/sound.repo';

export class PrismaSoundRepository implements ISoundRepository {
  constructor(private prisma: PrismaClient) {}
  async listByCarModel(carModelId: string, variant?: SoundVariant) {
    const where: any = { carModelId };
    if (variant) where.variant = variant;
    const rows = await this.prisma.sound.findMany({ where });
    return rows.map(
      (r) =>
        new Sound(
          r.id,
          r.carModelId,
          r.variant as SoundVariant,
          r.objectKey,
          r.durationSec ?? undefined,
          r.sampleRate ?? undefined,
          r.channels ?? undefined,
          r.bitrateKbps ?? undefined,
          r.license ?? undefined,
          r.attribution ?? undefined,
          r.qualityNote ?? undefined,
          r.createdAt,
          r.updatedAt ?? undefined
        )
    );
  }
}
