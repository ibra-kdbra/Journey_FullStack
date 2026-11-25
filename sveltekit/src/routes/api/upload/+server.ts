// Env Variables
import { PUBLIC_R2_BUCKET_NAME } from '$env/static/public';

// Types
import { type RequestHandler } from '@sveltejs/kit';

// Utils
import { error, json } from '@sveltejs/kit';
import { s3 } from '$lib/server/storage';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { uploadRequestSchema, UPLOAD_URL_EXPIRY_SECONDS } from '$lib/validations/files';

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    error(401, 'Unauthorized');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    error(400, 'Invalid request body');
  }

  const parsed = uploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    error(400, 'Invalid upload request');
  }
  const { fileType, fileSize, destinationDirectory } = parsed.data;

  try {
    const fileName = crypto.randomBytes(16).toString('hex');

    const file = {
      Bucket: PUBLIC_R2_BUCKET_NAME,
      Key: `${destinationDirectory}/${fileName}`,
      ContentType: fileType,
      ContentLength: fileSize
    };

    const command = new PutObjectCommand(file);
    const url = await getSignedUrl(s3, command, { expiresIn: UPLOAD_URL_EXPIRY_SECONDS });

    return json({
      presignedUrl: url,
      fileName
    });
  } catch (err) {
    console.log(err);
  }

  error(500, 'Something went wrong');
};
