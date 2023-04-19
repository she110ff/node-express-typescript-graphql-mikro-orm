import shortId from 'shortid';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { readFileSync, ReadStream } from 'fs';
import { createWriteStream, unlink } from 'node:fs';
import * as dotenv from 'dotenv';

dotenv.config();

export async function uploadImageToResize(
  upload: any,
): Promise<{ previewUrl: string; thumbnailUrl: string; originalUrl: string }> {
  try {
    const { createReadStream, filename } = await upload;
    console.log('uploadImageToResize.filename', filename);
    const tempId = shortId.generate();
    const tempOriginal = tempFilename(tempId, ImageType.ORIGINAL, filename);
    const tempOriginalPath = tempFileUrl(tempOriginal);
    await writeTempFile(createReadStream(), tempOriginalPath);
    console.log(`Created temp file ${tempOriginalPath}`);
    const { thumbnailUrl, previewUrl } = await resizeAndStore(
      tempId,
      filename,
      tempOriginalPath,
    );
    const originalUrl = await putS3(tempOriginal, tempOriginalPath);
    return { originalUrl, thumbnailUrl, previewUrl };
  } catch (e) {
    throw Error(`Failed to upload file: ${e}`);
  }
}

export async function uploadImage(upload: any): Promise<string> {
  try {
    const { createReadStream, filename } = await upload;
    console.log('uploadImage.filename', filename);
    const tempId = shortId.generate();
    const tempOriginal = tempFilename(tempId, ImageType.ORIGINAL, filename);
    const tempOriginalPath = tempFileUrl(tempOriginal);
    await writeTempFile(createReadStream(), tempOriginalPath);
    console.log(`Created temp file ${tempOriginalPath}`);

    const imagelUrl = await putS3(tempOriginal, tempOriginalPath);
    return imagelUrl;
  } catch (e) {
    throw Error(`Failed to upload file: ${e}`);
  }
}

enum ImageType {
  ORIGINAL = 'original',
  THUMBNAIL = 'thumbnail',
  PREVIEW = 'preview',
}

export function tempFileUrl(filename: string): URL {
  return new URL(
    filename,
    require('url').pathToFileURL('temp_image/').toString(),
  );
}

export function tempFilename(
  id: string,
  imageType: ImageType,
  originalFilename: string,
): string {
  const paddedName = imageType.padEnd(10, '-');
  return `${id}-${paddedName}-${originalFilename}`;
}

export async function writeTempFile(
  readable: ReadStream,
  tempFileURL: URL,
): Promise<void> {
  try {
    await new Promise((resolve, reject) => {
      const writable = createWriteStream(tempFileURL);
      writable.on('finish', resolve);
      writable.on('error', (err) => {
        console.error(err);
        unlink(tempFileURL, (e) => {
          console.error(
            `writeTempFile: Failed to remove temp file '${tempFileURL.pathname}' `,
            e,
          );
          throw err;
        });
        reject(err);
      });
      readable.pipe(writable);
    });
  } catch (e) {
    throw Error(`Failed to write temp file ${tempFileURL.pathname}: ${e}`);
  }
}

function imageWidth(imageType: ImageType) {
  if (imageType === ImageType.THUMBNAIL) return 350;
  if (imageType === ImageType.PREVIEW) return 700;
  throw Error(`Resize is not implemented for image type ${imageType}`);
}

function imageHeight(imageType: ImageType) {
  if (imageType === ImageType.THUMBNAIL) return 350;
  if (imageType === ImageType.PREVIEW) return 700;
  throw Error(`Resize is not implemented for image type ${imageType}`);
}

export async function resizeAndStore(
  id: string,
  originalName: string,
  originalPath: URL,
): Promise<{ thumbnailUrl: string; previewUrl: string }> {
  const thumbnailUrl = await resize(
    id,
    originalName,
    originalPath,
    ImageType.THUMBNAIL,
  );
  const previewUrl = await resize(
    id,
    originalName,
    originalPath,
    ImageType.PREVIEW,
  );
  return { thumbnailUrl, previewUrl };
}

async function resize(
  id: string,
  name: string,
  path: URL,
  imageType: ImageType,
): Promise<string> {
  const resizedName = tempFilename(id, imageType, name);
  const resizedPath = tempFileUrl(resizedName);
  try {
    const original = decodeURIComponent(path.pathname);
    const resized = decodeURIComponent(resizedPath.pathname);
    const width = imageWidth(imageType);
    const height = imageHeight(imageType);
    console.log(
      `Resize file to ${width}x${height} file ${original} -> ${resized}`,
    );
    await sharp(original)
      .resize(width, height, { fit: 'inside' })
      .toFile(resized);
  } catch (e) {
    throw Error(`Failed during resize of image: ${e}`);
  }
  try {
    const s3Url = await putS3(resizedName, resizedPath);
    return s3Url;
  } catch (e) {
    throw Error(`Failed during send to s3: ${e}`);
  }
}

export const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: defaultProvider(),
});

export async function putS3(filename: string, tempFile: URL): Promise<string> {
  const fileContent = readFileSync(tempFile);
  console.log(`Read ${fileContent.length} bytes to buffer`);
  unlink(tempFile, (e) => {
    if (e) {
      console.error(
        `putS3: Failed to remove temp file '${tempFile.pathname}' `,
        e,
      );
      throw e;
    }
  });
  console.log(`putS3:from temp file ${tempFile.pathname}`);
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `api-server-image-store/${filename}`,
    Body: fileContent,
  };
  try {
    const result = await s3Client.send(new PutObjectCommand(params));
    console.log(result);
  } catch (e) {
    throw Error(
      `Failed PutObjectCommand to bucket ${params.Bucket} for file ${params.Key}`,
    );
  }
  return `https://s3.${process.env.S3_REGION}.amazonaws.com/${process.env.S3_BUCKET_NAME}/${params.Key}`;
}
