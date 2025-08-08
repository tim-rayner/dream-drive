import { PrismaClient } from '@prisma/client';
import { ICarAliasRepository } from '../../domain/interfaces/car-alias.repo';
import { aliasApplicable } from '../../domain/policies/car-alias.policy';

export class PrismaCarAliasRepository implements ICarAliasRepository {
  constructor(private prisma: PrismaClient) {}
  async resolveAlias(
    make: string,
    model: string,
    year?: number,
    engineCode?: string
  ) {
    const rows = await this.prisma.carAlias.findMany({
      where: { make, model, ...(engineCode ? { engineKey: engineCode } : {}) },
      orderBy: [{ yearFrom: 'desc' }], // prefer tighter ranges
      take: 10,
    });
    const hit = rows.find((r) =>
      aliasApplicable(year, r.yearFrom ?? undefined, r.yearTo ?? undefined)
    );
    return hit ? { carModelId: hit.carModelId } : null;
    // If none, return null and let canonical/fuzzy happen upstream if you add it.
  }
}
