import { IApiKeyRepository } from '../../domain/interfaces/api-key.repo';
import { canUseKey } from '../../domain/policies/api-key.policy';
import { KeygenService } from '../../domain/services/keygen.service';

export class VerifyApiKeyUseCase {
  constructor(private readonly repo: IApiKeyRepository) {}
  async execute(plaintext: string) {
    const { prefix, hash } = KeygenService.hashWithPrefix(plaintext);
    const found = await this.repo.findByPrefixAndHash(prefix, hash);
    if (!found || !canUseKey(found.status)) return null;
    return found;
  }
}
