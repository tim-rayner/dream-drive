import { ApiKey } from '../../domain/entities/api-key.entity';
import { IApiKeyRepository } from '../../domain/interfaces/api-key.repo';
import { KeygenService } from '../../domain/services/keygen.service';

export class IssueApiKeyUseCase {
  constructor(private readonly repo: IApiKeyRepository) {}
  async execute(input: { name: string; scope?: string[] }) {
    const { plaintext, prefix, hash, id } = KeygenService.generate(input.name);
    const entity = new ApiKey(
      id,
      input.name,
      prefix,
      hash,
      input.scope ?? ['engine-tone.read'],
      'active',
      new Date()
    );
    await this.repo.create(entity);
    // Return plaintext ONCE
    return { apiKey: plaintext, id: entity.id, prefix };
  }
}
