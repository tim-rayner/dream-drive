export type SoundVariant =
  | 'idle'
  | 'rev'
  | 'driveby'
  | 'onboard'
  | 'launch'
  | 'misc';

export class Sound {
  constructor(
    public readonly id: string,
    public readonly carModelId: string, // FK -> CarModel.id
    public readonly variant: SoundVariant,
    public readonly objectKey: string, // storage key (not a signed URL)
    public readonly durationSec?: number,
    public readonly sampleRate?: number, // Hz
    public readonly channels?: number, // 1/2
    public readonly bitrateKbps?: number,
    public readonly license?: string, // SPDX or text
    public readonly attribution?: string,
    public readonly qualityNote?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt?: Date
  ) {}

  // Simple helper for ranking quality
  qualityScore(): number {
    const dur = Math.min(1, (this.durationSec ?? 0) / 10); // 0..1
    const br = Math.min(1, (this.bitrateKbps ?? 0) / 256); // 0..1
    const ch = (this.channels ?? 1) >= 2 ? 1 : 0.8; // slight bump for stereo
    return +(0.5 * dur + 0.4 * br + 0.1 * ch).toFixed(2);
  }
}
