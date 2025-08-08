import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStoragePort } from '../../domain/interfaces/storage.port';

export class S3StorageAdapter implements IStoragePort {
  private s3 = new S3Client({ region: process.env.AWS_REGION });
  async sign(objectKey: string, expiresSec: number) {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: process.env.ENGINE_TONE_BUCKET!,
        Key: objectKey,
      }),
      { expiresIn: expiresSec }
    );
  }
}
