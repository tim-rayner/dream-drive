import { ApiKey } from '../entities/api-key.entity';

export interface IApiKeyRepository {
  findByPrefixAndHash(prefix: string, hash: string): Promise<ApiKey | null>;
  create(entity: ApiKey): Promise<void>;
  setRevoked(id: string): Promise<void>;
  markUsed(id: string, when: Date): Promise<void>;
  list(): Promise<ApiKey[]>;
}
