import { createHash, randomBytes } from 'crypto';

export class KeygenService {
  static generate(name: string) {
    const id = crypto.randomUUID();
    const prefix = randomBytes(4).toString('hex'); // 8 chars
    const secret = randomBytes(24).toString('base64url'); // ~32
    const plaintext = `etk_live_${prefix}_${secret}`;
    const hash = createHash('sha256').update(plaintext).digest('hex');
    return { id, plaintext, prefix, hash };
  }
  static hashWithPrefix(plaintext: string) {
    const parts = plaintext.split('_'); // etk_live_<prefix>_<secret>
    const prefix = parts[2];
    const hash = createHash('sha256').update(plaintext).digest('hex');
    return { prefix, hash };
  }
}
