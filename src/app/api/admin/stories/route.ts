import { NextRequest } from "next/server";
import { protectRoute, errorResponse, paginatedResponse, successResponse } from "@/lib/auth-middleware";
import { getPrisma } from "@/lib/prisma";
import { removeStoryImages, uploadStoryImages, validateStoryFiles, type StoryImageMeta } from "@/lib/story-upload";
import { storyFieldsSchema, validatePagination } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const auth = protectRoute(request); if (!auth.authenticated) return auth.response;
  const prisma = getPrisma(); if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
  const { page, pageSize } = validatePagination(Number(request.nextUrl.searchParams.get("page") || 1), Number(request.nextUrl.searchParams.get("pageSize") || 20));
  const search = request.nextUrl.searchParams.get("search")?.trim();
  const where = search ? { title: { contains: search, mode: "insensitive" as const } } : {};
  const [stories, total] = await Promise.all([
    prisma.story.findMany({ where, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, _count: { select: { images: true } } }, orderBy: { updatedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.story.count({ where }),
  ]);
  return paginatedResponse(stories, page, pageSize, total);
}

export async function POST(request: NextRequest) {
  const auth = protectRoute(request); if (!auth.authenticated) return auth.response;
  const prisma = getPrisma(); if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
  let storyId = ""; let uploadedPaths: string[] = [];
  try {
    const body = await request.formData();
    const parsed = storyFieldsSchema.safeParse(Object.fromEntries(["title", "subtitle", "slug", "excerpt", "content", "category", "tags", "country", "city", "location", "status", "publishedAt", "archiveDate", "licenseType", "copyrightOwner", "contactEmail", "contactWebsite", "displayPrice", "views", "likes", "downloads", "favorites", "seoTitle", "seoDescription"].map((key) => [key, String(body.get(key) || "")])));
    if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ", 400);
    const files = body.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    let remoteImages: { url:string; path:string; alt?:string; caption?:string; width:number; height:number; fileSize:number }[] = [];
    try { remoteImages = JSON.parse(String(body.get("remoteImages") || "[]")); } catch { return errorResponse("Thông tin Cloudinary không hợp lệ", 400); }
    if (remoteImages.length) {
      if (remoteImages.length > 25 || remoteImages.some((image) => !/^https:\/\/res\.cloudinary\.com\//.test(image.url) || image.fileSize > 10 * 1024 * 1024)) return errorResponse("Danh sách ảnh Cloudinary không hợp lệ", 400);
    } else validateStoryFiles(files);
    let metas: StoryImageMeta[] = []; try { metas = JSON.parse(String(body.get("imageMeta") || "[]")); } catch { return errorResponse("Thông tin ảnh không hợp lệ", 400); }
    const slug = slugify(parsed.data.slug || parsed.data.title);
    const exists = await prisma.story.findUnique({ where: { slug }, select: { id: true } });
    if (exists) return errorResponse("Slug đã được sử dụng", 409);
    const story = await prisma.story.create({ data: { title: parsed.data.title, subtitle: parsed.data.subtitle || null, slug, excerpt: parsed.data.excerpt || null, content: parsed.data.content || null, category: parsed.data.category || null, tags: parsed.data.tags || null, country: parsed.data.country || null, city: parsed.data.city || null, location: parsed.data.location || null, status: parsed.data.status, licenseType: parsed.data.licenseType, copyrightOwner: parsed.data.copyrightOwner || null, contactEmail: parsed.data.contactEmail || null, contactWebsite: parsed.data.contactWebsite || null, displayPrice: parsed.data.displayPrice || null, views: parsed.data.views, likes: parsed.data.likes, downloads: parsed.data.downloads, favorites: parsed.data.favorites, seoTitle: parsed.data.seoTitle || null, seoDescription: parsed.data.seoDescription || null, publishedAt: parsed.data.status === "PUBLISHED" ? (parsed.data.publishedAt ? new Date(`${parsed.data.publishedAt}T00:00:00.000Z`) : new Date()) : null, archiveDate: parsed.data.archiveDate ? new Date(`${parsed.data.archiveDate}T00:00:00.000Z`) : null } });
    storyId = story.id;
    const images = remoteImages.length ? remoteImages.map((image) => ({ ...image, alt: image.alt?.trim() || null, caption: image.caption?.trim() || null })) : await uploadStoryImages(files, metas, story.id); uploadedPaths = remoteImages.length ? [] : images.map((image) => image.path);
    const result = await prisma.story.update({ where: { id: story.id }, data: { images: { create: images.map((image, sortOrder) => ({ ...image, sortOrder })) } }, include: { images: { orderBy: { sortOrder: "asc" } } } });
    return successResponse(result, 201);
  } catch (error) {
    if (uploadedPaths.length) await removeStoryImages(uploadedPaths);
    if (storyId) await prisma.story.delete({ where: { id: storyId } }).catch(() => undefined);
    console.error("Story creation error:", error);
    return errorResponse(error instanceof Error ? error.message : "Không thể tạo bài viết", 500);
  }
}
