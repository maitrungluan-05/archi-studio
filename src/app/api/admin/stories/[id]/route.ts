import { NextRequest } from "next/server";
import { protectRoute, errorResponse, successResponse } from "@/lib/auth-middleware";
import { getPrisma } from "@/lib/prisma";
import { removeStoryImages, uploadStoryImages, validateStoryFiles, type StoryImageMeta } from "@/lib/story-upload";
import { storyFieldsSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { generateContentDefaults } from "@/lib/auto-content";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = protectRoute(request); if (!auth.authenticated) return auth.response;
  const prisma = getPrisma(); if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
  const { id } = await params;
  const story = await prisma.story.findFirst({ where: { OR: [{ id }, { slug: id }] }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  return story ? successResponse(story) : errorResponse("Không tìm thấy bài viết", 404);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = protectRoute(request); if (!auth.authenticated) return auth.response;
  const prisma = getPrisma(); if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
  const { id } = await params;
  const existing = await prisma.story.findUnique({ where: { id }, include: { images: true } });
  if (!existing) return errorResponse("Không tìm thấy bài viết", 404);
  let uploadedPaths: string[] = [];
  try {
    const body = await request.formData();
    const parsed = storyFieldsSchema.safeParse(Object.fromEntries(["title", "subtitle", "slug", "excerpt", "content", "category", "tags", "country", "city", "location", "status", "publishedAt", "archiveDate", "licenseType", "copyrightOwner", "contactEmail", "contactWebsite", "displayPrice", "views", "likes", "downloads", "favorites", "seoTitle", "seoDescription"].map((key) => [key, String(body.get(key) || "")])));
    if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ", 400);
    const files = body.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    let keepIds: string[] = []; let metas: StoryImageMeta[] = []; let existingMeta: Record<string, StoryImageMeta> = {}; let remoteImages: { url:string; path:string; alt?:string; caption?:string; width:number; height:number; fileSize:number }[] = [];
    try { keepIds = JSON.parse(String(body.get("keepImageIds") || "[]")); metas = JSON.parse(String(body.get("imageMeta") || "[]")); existingMeta = JSON.parse(String(body.get("existingMeta") || "{}")); remoteImages = JSON.parse(String(body.get("remoteImages") || "[]")); } catch { return errorResponse("Thông tin ảnh không hợp lệ", 400); }
    const validKeep = keepIds.filter((imageId) => existing.images.some((image) => image.id === imageId));
    if (remoteImages.length) {
      if (remoteImages.length + validKeep.length > 25 || remoteImages.some((image) => !/^https:\/\/res\.cloudinary\.com\//.test(image.url) || image.fileSize > 10 * 1024 * 1024)) return errorResponse("Danh sách ảnh Cloudinary không hợp lệ", 400);
    } else validateStoryFiles(files, validKeep.length);
    const slug = slugify(parsed.data.slug || parsed.data.title);
    const generated = generateContentDefaults(parsed.data.title, parsed.data.category, parsed.data.location);
    const duplicate = await prisma.story.findFirst({ where: { slug, NOT: { id } }, select: { id: true } });
    if (duplicate) return errorResponse("Slug đã được sử dụng", 409);
    const uploaded = remoteImages.length ? remoteImages.map((image) => ({ ...image, alt: image.alt?.trim() || null, caption: image.caption?.trim() || null })) : await uploadStoryImages(files, metas, id); uploadedPaths = remoteImages.length ? [] : uploaded.map((image) => image.path);
    const removed = existing.images.filter((image) => !validKeep.includes(image.id));
    const wasPublished = existing.status === "PUBLISHED";
    const result = await prisma.$transaction(async (tx) => {
      await tx.storyImage.deleteMany({ where: { storyId: id } });
      return tx.story.update({ where: { id }, data: {
        title: parsed.data.title, subtitle: parsed.data.subtitle || null, slug, excerpt: parsed.data.excerpt || generated.description, content: parsed.data.content || generated.story, category: parsed.data.category || null, tags: parsed.data.tags || generated.tags, country: parsed.data.country || null, city: parsed.data.city || null, location: parsed.data.location || null, status: parsed.data.status, licenseType: parsed.data.licenseType, copyrightOwner: parsed.data.copyrightOwner || null, contactEmail: parsed.data.contactEmail || null, contactWebsite: parsed.data.contactWebsite || null, displayPrice: parsed.data.displayPrice || generated.displayPrice, views: parsed.data.views, likes: parsed.data.likes, downloads: parsed.data.downloads, favorites: parsed.data.favorites, archiveDate: parsed.data.archiveDate ? new Date(`${parsed.data.archiveDate}T00:00:00.000Z`) : null,
        seoTitle: parsed.data.seoTitle || generated.seoTitle, seoDescription: parsed.data.seoDescription || generated.seoDescription,
        publishedAt: parsed.data.status === "PUBLISHED" ? (parsed.data.publishedAt ? new Date(`${parsed.data.publishedAt}T00:00:00.000Z`) : (wasPublished ? existing.publishedAt : new Date())) : null,
        images: { create: [...validKeep.map((imageId) => { const image = existing.images.find((item) => item.id === imageId)!; const meta = existingMeta[imageId]; return { url: image.url, path: image.path, fileSize: image.fileSize, width: image.width, height: image.height, alt: meta?.alt?.trim() || null, caption: meta?.caption?.trim() || null }; }), ...uploaded].map((image, sortOrder) => ({ ...image, sortOrder })) },
      }, include: { images: { orderBy: { sortOrder: "asc" } } } });
    });
    await removeStoryImages(removed.map((image) => image.path));
    return successResponse(result);
  } catch (error) {
    if (uploadedPaths.length) await removeStoryImages(uploadedPaths);
    console.error("Story update error:", error);
    return errorResponse(error instanceof Error ? error.message : "Không thể cập nhật bài viết", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = protectRoute(request); if (!auth.authenticated) return auth.response;
  const prisma = getPrisma(); if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
  const { id } = await params;
  const story = await prisma.story.findUnique({ where: { id }, include: { images: { select: { path: true } } } });
  if (!story) return errorResponse("Không tìm thấy bài viết", 404);
  await prisma.story.delete({ where: { id } });
  await removeStoryImages(story.images.map((image) => image.path));
  return successResponse({ id });
}
