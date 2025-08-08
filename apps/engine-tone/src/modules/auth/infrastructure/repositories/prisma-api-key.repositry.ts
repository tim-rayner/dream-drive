import { PrismaClient } from '@prisma/client';
import { IApiKeyRepository } from '../../domain/interfaces/api-key.repo';
import { ApiKey } from '../../domain/entities/api-key.entity';

export class PrismaApiKeyRepository implements IApiKeyRepository {
  constructor(private prisma: PrismaClient) {}
  async findByPrefixAndHash(prefix: string, hash: string) {
    const r = await this.prisma.apiKey.findFirst({ where: { prefix, hash } });
    return r ? new ApiKey(r.id, r.name, r.prefix, r.hash, JSON.parse(r.scope), r.status as any, r.createdAt, r.lastUsedAt ?? undefined) : null;
  }
  async create(e: ApiKey) {
    await this.prisma.apiKey.create({
      data: {
        id: e.id, name: e.name, prefix: e.prefix, hash: e.hash,
        scope: JSON.stringify(e.scope), status: e.status, createdAt: e.createdAt,
      },
    });
  }
  async setRevoked(id: string) {
    await this.prisma.apiKey.update({ where: { id }, data: { status: 'revoked' } });
  }
  async markUsed(id: string, when: Date) {
    await this.prisma.apiKey.update({ where: { id }, data: { lastUsedAt: when } });
  }
  async list() {
    const rows = await this.prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(r => new ApiKey(r.id, r.name, r.prefix, r.hash, JSON.parse(r.scope), r.status as any, r.createdAt, r.lastUsedAt ?? undefined));
  }