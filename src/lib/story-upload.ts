import { getSupabaseAdmin } from "@/lib/supabase";
import { STORY_MAX_FILE_SIZE, STORY_MAX_IMAGES, STORY_MAX_TOTAL_SIZE } from "@/lib/validators";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export type StoryImageMeta = { alt?: string; caption?: string; width?: number; height?: number };

export function validateStoryFiles(files: File[], existingCount = 0) {
  if (files.length + existingCount < 1 || files.length + existingCount > STORY_MAX_IMAGES) {
    throw new Error(`Mỗi bài viết cần từ 1 đến ${STORY_MAX_IMAGES} ảnh.`);
  }
  if (files.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc AVIF.");
  if (files.some((file) => file.size > STORY_MAX_FILE_SIZE)) throw new Error("Mỗi ảnh không được vượt quá 10 MB.");
  if (files.reduce((sum, file) => sum + file.size, 0) > STORY_MAX_TOTAL_SIZE) throw new Error("Tổng dung lượng ảnh không được vượt quá 100 MB.");
}

export async function uploadStoryImages(files: File[], metas: StoryImageMeta[], storyId: string) {
  const storage = getSupabaseAdmin();
  if (!storage) throw new Error("Chưa cấu hình Supabase Storage.");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "archive-media";
  const uploaded: { url: string; path: string; alt: string | null; caption: string | null; width: number; height: number; fileSize: number }[] = [];
  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `stories/${storyId}/${crypto.randomUUID()}.${extension}`;
      const result = await storage.storage.from(bucket).upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
      if (result.error) throw result.error;
      const { data } = storage.storage.from(bucket).getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, path, alt: metas[index]?.alt?.trim() || null, caption: metas[index]?.caption?.trim() || null, width: Math.max(1, metas[index]?.width || 1600), height: Math.max(1, metas[index]?.height || 1200), fileSize: file.size });
    }
    return uploaded;
  } catch (error) {
    if (uploaded.length) await storage.storage.from(bucket).remove(uploaded.map((image) => image.path));
    throw error;
  }
}

export async function removeStoryImages(paths: string[]) {
  if (!paths.length) return;
  const storage = getSupabaseAdmin();
  if (!storage) return;
  await storage.storage.from(process.env.SUPABASE_STORAGE_BUCKET || "archive-media").remove(paths);
}
