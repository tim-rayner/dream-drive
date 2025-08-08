export type ApiKeyStatus = 'active' | 'revoked';

export class ApiKey {
  constructor(
    public readonly id: string, // uuid/cuid
    public readonly name: string, // human label
    public readonly prefix: string, // first 6–10 chars for quick lookup
    public readonly hash: string, // sha256(plaintext)
    public readonly scope: string[], // e.g. ['engine-tone.read']
    public status: ApiKeyStatus,
    public readonly createdAt: Date,
    public lastUsedAt?: Date
  ) {}

  revoke() {
    if (this.status === 'revoked') return;
    this.status = 'revoked';
  }

  markUsed(at: Date = new Date()) {
    this.lastUsedAt = at;
  }
}
