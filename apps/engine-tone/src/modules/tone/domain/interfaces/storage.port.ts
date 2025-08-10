export interface IStoragePort {
  /**
   * Create a signed, time-limited URL for the given object key.
   * @param objectKey e.g., "sounds/nissan/gt-r/vr38dett/rev-01.mp3"
   * @param expiresSec TTL in seconds (e.g., 3600)
   */
  sign(objectKey: string, expiresSec: number): Promise<string>;
}
