import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint=process.env.AWS_ENDPOINT_URL_S3;
const bucket=process.env.AWS_S3_BUCKET;

export const storageConfigured=Boolean(endpoint && bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

const client=storageConfigured?new S3Client({
  region:process.env.AWS_REGION||"ap-southeast-1",
  endpoint,
  forcePathStyle:true,
  credentials:{accessKeyId:process.env.AWS_ACCESS_KEY_ID,secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY}
}):null;

export async function uploadObject({key,body,contentType}) {
  if(!client) throw new Error("Neon Object Storage is not configured.");
  await client.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:body,ContentType:contentType}));
  return key;
}
export async function getObjectUrl(key,expiresIn=3600) {
  if(!client) throw new Error("Neon Object Storage is not configured.");
  return getSignedUrl(client,new GetObjectCommand({Bucket:bucket,Key:key}),{expiresIn});
}
