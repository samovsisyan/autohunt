import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Image/document storage. STORAGE_DRIVER=s3 uploads to any S3-compatible bucket
 * (AWS S3, Cloudflare R2, DigitalOcean Spaces); otherwise files go to public/uploads.
 */
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["application/pdf", "pdf"],
]);
const MAX_BYTES = 12 * 1024 * 1024;

export class UploadError extends Error {}

export async function storeFile(file: File, folder = "cars"): Promise<string> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new UploadError(`Unsupported file type: ${file.type}`);
  if (file.size > MAX_BYTES) throw new UploadError("File too large (max 12 MB)");

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "misc";
  const key = `${safeFolder}/${new Date().getFullYear()}/${randomBytes(10).toString("hex")}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());

  if (process.env.STORAGE_DRIVER === "s3") {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: body,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${process.env.S3_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
  }

  const dest = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, body);
  return `/uploads/${key}`;
}
