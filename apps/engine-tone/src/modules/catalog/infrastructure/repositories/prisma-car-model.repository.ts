import { PrismaClient } from '@prisma/client';
import { CarModel } from '../../domain/entities/car-model.entity';
import { ICarModelRepository } from '../../domain/interfaces/car-model.repo';

export class PrismaCarModelRepository implements ICarModelRepository {
  constructor(private prisma: PrismaClient) {}
  async findCanonical(make: string, model: string) {
    const r = await this.prisma.carModel.findFirst({ where: { make, model } });
    return r
      ? new CarModel(
          r.id,
          r.make,
          r.model,
          r.yearFrom ?? undefined,
          r.yearTo ?? undefined,
          r.engineKey ?? undefined
        )
      : null;
  }
  async findById(id: string) {
    const r = await this.prisma.carModel.findUnique({ where: { id } });
    return r
      ? new CarModel(
          r.id,
          r.make,
          r.model,
          r.yearFrom ?? undefined,
          r.yearTo ?? undefined,
          r.engineKey ?? undefined
        )
      : null;
  }
  async listAll() {
    const rows = await this.prisma.carModel.findMany();
    return rows.map(
      (r) =>
        new CarModel(
          r.id,
          r.make,
          r.model,
          r.yearFrom ?? undefined,
          r.yearTo ?? undefined,
          r.engineKey ?? undefined
        )
    );
  }
}
