export type CloudinaryUpload = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  width: number;
  height: number;
  bytes: number;
  format: string;
};

export function isCloudinaryConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
}

export async function uploadToCloudinary(file: File, folder: string): Promise<CloudinaryUpload> {
  const signatureResponse = await fetch("/api/admin/cloudinary-signature", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folder }) });
  const signatureBody = await signatureResponse.json().catch(() => null);
  if (!signatureResponse.ok) throw new Error(signatureBody?.error || "Không thể tạo chữ ký Cloudinary.");
  const { cloudName, apiKey, timestamp, signature } = signatureBody.data;
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const body = new FormData();
  body.set("file", file); body.set("api_key", apiKey); body.set("timestamp", String(timestamp)); body.set("signature", signature); body.set("folder", folder);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, { method: "POST", body });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error?.message || `Không thể tải ${file.name} lên Cloudinary.`);
  return { url: result.secure_url, publicId: result.public_id, resourceType, width: result.width || 1, height: result.height || 1, bytes: result.bytes || file.size, format: result.format || file.name.split(".").pop() || "" };
}

export async function uploadManyToCloudinary(files: File[], folder: string, concurrency = 3) {
  const results = new Array<CloudinaryUpload>(files.length);
  let cursor = 0;
  async function worker() {
    while (cursor < files.length) {
      const index = cursor; cursor += 1;
      results[index] = await uploadToCloudinary(files[index], folder);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, () => worker()));
  return results;
}
