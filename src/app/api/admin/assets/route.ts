import { NextRequest } from "next/server";
import { protectRoute, errorResponse, paginatedResponse, successResponse } from "@/lib/auth-middleware";
import { validatePagination } from "@/lib/validators";
import { getMockAssets } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import { generateImageMetadata, generatePublicId, generateSlug } from "@/lib/asset-utils";
import { generateContentDefaults } from "@/lib/auto-content";

// ============================================================
// Admin Assets List Endpoint
// ============================================================
// GET /api/admin/assets
// Protected admin route - list all assets with filtering and pagination
// Query params: page, pageSize, status, categoryId, search
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = protectRoute(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search")?.toLowerCase() || "";

    // Validate pagination
    const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);

    const prisma = getPrisma();
    if (prisma) {
      const where = {
        ...(status ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(search ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { publicId: { contains: search, mode: "insensitive" as const } },
            { stockId: { contains: search, mode: "insensitive" as const } },
          ],
        } : {}),
      };
      const [assets, total] = await Promise.all([
        prisma.asset.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: "desc" },
          skip: (validPage - 1) * validPageSize,
          take: validPageSize,
        }),
        prisma.asset.count({ where }),
      ]);
      return paginatedResponse(assets.map((asset) => ({
        id: asset.id,
        publicId: asset.publicId,
        stockId: asset.stockId,
        slug: asset.slug,
        title: asset.title,
        type: asset.type,
        status: asset.status,
        thumbnailUrl: asset.thumbnailUrl,
        categoryName: asset.category?.name ?? "Uncategorized",
        views: asset.views,
        publishDate: asset.publishDate,
      })), validPage, validPageSize, total);
    }

    let assets = getMockAssets();

    // Apply filters
    if (status) {
      assets = assets.filter((a) => a.status === status);
    }

    if (categoryId) {
      assets = assets.filter((a) => a.categoryName?.toLowerCase() === categoryId.toLowerCase());
    }

    if (search) {
      assets = assets.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.description?.toLowerCase().includes(search) ||
          a.publicId.toLowerCase().includes(search) ||
          a.stockId.toLowerCase().includes(search)
      );
    }

    // Calculate pagination
    const total = assets.length;
    const startIndex = (validPage - 1) * validPageSize;
    const endIndex = startIndex + validPageSize;
    const paginatedAssets = assets.slice(startIndex, endIndex);

    // Map to response format (exclude sensitive data)
    const responseAssets = paginatedAssets.map((asset) => ({
      id: asset.id,
      publicId: asset.publicId,
      stockId: asset.stockId,
      slug: asset.slug,
      title: asset.title,
      description: asset.description,
      type: asset.type,
      status: asset.status,
      thumbnailUrl: asset.thumbnailUrl,
      categoryName: asset.categoryName,
      views: asset.views,
      likes: asset.likes,
      createdAt: asset.createdAt,
      publishDate: asset.publishDate,
    }));

    return paginatedResponse(responseAssets, validPage, validPageSize, total);
  } catch (error) {
    console.error("Assets list error:", error);
    return errorResponse("Không thể tải danh sách tài sản", 500);
  }
}

// ============================================================
// Admin Create Asset
// ============================================================
// POST /api/admin/assets
// Protected admin route - create new asset
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = protectRoute(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    const prisma = getPrisma();
    if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);

    const body = await request.formData();
    const file = body.get("file");
    let remoteMedia: { url: string; publicId: string; resourceType: "image" | "video"; width: number; height: number; bytes: number; format: string } | null = null;
    try { remoteMedia = JSON.parse(String(body.get("remoteMedia") || "null")); } catch { return errorResponse("Thông tin Cloudinary không hợp lệ", 400); }
    const title = body.get("title");
    const assetType = remoteMedia?.resourceType === "video" || (file instanceof File && file.type.startsWith("video/")) ? "VIDEO" : "IMAGE";

    // Validate required fields
    if (typeof title !== "string" || !title.trim()) {
      return errorResponse("Tiêu đề là bắt buộc", 400);
    }

    if (!remoteMedia?.url && (!(file instanceof File) || file.size === 0)) {
      return errorResponse("Vui lòng chọn ảnh hoặc video", 400);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
    const maxSize = assetType === "VIDEO" ? 250 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file instanceof File && file.size > 0) {
      if (!allowedTypes.includes(file.type)) return errorResponse("Định dạng tệp không được hỗ trợ", 415);
      if (file.size > maxSize) return errorResponse(`Tệp vượt quá giới hạn ${assetType === "VIDEO" ? "250 MB" : "25 MB"}`, 413);
    }
    if (!remoteMedia || !/^https:\/\/res\.cloudinary\.com\//.test(remoteMedia.url)) return errorResponse("URL Cloudinary không hợp lệ", 400);
    const slug = `${generateSlug(title)}-${crypto.randomUUID().slice(0, 8)}`;
    const categoryName = body.get("category");
    const category = typeof categoryName === "string" && categoryName
      ? await prisma.category.findUnique({ where: { name: categoryName } })
      : null;
    const status = body.get("status") === "DRAFT" ? "DRAFT" : "PUBLISHED";
    const requestedPublishDate = String(body.get("publishDate") || "");
    const publishDate = status === "PUBLISHED"
      ? (requestedPublishDate ? new Date(`${requestedPublishDate}T00:00:00.000Z`) : new Date())
      : null;
    const copyrightOwner = String(body.get("copyrightOwner") || "").trim();
    const generated = generateContentDefaults(title.trim(), String(body.get("category") || ""), String(body.get("location") || ""));
    const views = Math.max(0, Number.parseInt(String(body.get("views") || "0"), 10) || 0);
    const likes = Math.max(0, Number.parseInt(String(body.get("likes") || "0"), 10) || 0);
    const requestedArchiveDate = String(body.get("archiveDate") || "");
    const archiveDate = requestedArchiveDate ? new Date(`${requestedArchiveDate}T00:00:00.000Z`) : new Date();
    const archiveYear = archiveDate.getUTCFullYear();
    const imageMetadata = assetType === "IMAGE" ? generateImageMetadata() : null;

    const asset = await prisma.asset.create({
      data: {
        publicId: generatePublicId(),
        stockId: `${assetType === "VIDEO" ? "VID" : "IMG"}-${archiveYear}-${Date.now().toString().slice(-6)}`,
        slug,
        type: assetType,
        status,
        title: title.trim(),
        subtitle: String(body.get("subtitle") || "").trim() || null,
        description: String(body.get("description") || "").trim() || generated.description,
        story: String(body.get("story") || "").trim() || generated.story,
        keywords: String(body.get("tags") || "").trim() || generated.tags,
        displayPrice: String(body.get("displayPrice") || "").replace(/[$,\s]/g, "") || generated.displayPrice,
        licenseType: String(body.get("licenseType") || "RIGHTS_MANAGED") as "RIGHTS_MANAGED" | "ROYALTY_FREE" | "EDITORIAL" | "PERSONAL" | "COMMERCIAL",
        originalUrl: remoteMedia.url,
        thumbnailUrl: remoteMedia.url,
        previewUrl: remoteMedia.url,
        fileSize: remoteMedia.bytes,
        mimeType: `${remoteMedia.resourceType}/${remoteMedia.format}`,
        copyrightYear: archiveYear,
        createdAt: archiveDate,
        publishDate,
        publicContactEmail: String(body.get("publicContactEmail") || "").trim() || null,
        publicContactWebsite: String(body.get("publicContactWebsite") || "").trim() || null,
        seoTitle: String(body.get("seoTitle") || "").trim() || generated.seoTitle,
        seoDescription: String(body.get("seoDescription") || "").trim() || generated.seoDescription,
        country: String(body.get("country") || "").trim() || null,
        city: String(body.get("city") || "").trim() || null,
        location: String(body.get("location") || "").trim() || null,
        views,
        likes,
        ...(imageMetadata ?? {}),
        width: remoteMedia.width,
        height: remoteMedia.height,
        resolution: `${remoteMedia.width} x ${remoteMedia.height}`,
        categoryId: category?.id,
        ...(copyrightOwner ? {
          rightsHolders: {
            create: { name: copyrightOwner, role: "COPYRIGHT_OWNER", isPrimary: true, isPublic: true },
          },
        } : {}),
      },
    });

    return successResponse(asset, 201);
  } catch (error) {
    console.error("Asset creation error:", error);
    return errorResponse("Không thể tạo tài sản", 500);
  }
}
