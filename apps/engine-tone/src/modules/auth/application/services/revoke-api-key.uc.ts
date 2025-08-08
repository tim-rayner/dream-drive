import { IApiKeyRepository } from '../../domain/interfaces/api-key.repo';

export class RevokeApiKeyUseCase {
  constructor(private readonly repo: IApiKeyRepository) {}
  async execute(id: string) {
    await this.repo.setRevoked(id);
  }
}
