import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { validateImage } from './image-validation';

const AWS_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
const AWS_S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION;

if (!AWS_ACCESS_KEY || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET || !AWS_REGION) {
  throw new Error('Missing required AWS environment variables');
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(file: File, folder: string = 'passes'): Promise<string> {
  try {
    // Validate the image before uploading
    const validationError = validateImage(file);
    if (validationError) {
      throw new Error(validationError.message);
    }

    const fileBuffer = await file.arrayBuffer();
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

    console.log('Attempting to upload');

    await s3Client.send(
      new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: fileName,
        Body: Buffer.from(fileBuffer),
        ContentType: file.type,
        ACL: 'public-read',
      })
    );

    const url = `https://${AWS_S3_BUCKET}.s3.amazonaws.com/${fileName}`;
    console.log('Upload successful, URL:', url);
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
    throw new Error('Failed to upload file to S3');
  }
}
