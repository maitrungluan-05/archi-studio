import { NextRequest } from "next/server";
import { protectRoute, errorResponse, paginatedResponse, successResponse } from "@/lib/auth-middleware";
import { validatePagination } from "@/lib/validators";
import { getMockAssets } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateImageMetadata, generatePublicId, generateSlug } from "@/lib/asset-utils";

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
  let uploadedPath: string | null = null;
  try {
    // Verify authentication
    const auth = protectRoute(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    const prisma = getPrisma();
    const storage = getSupabaseAdmin();
    if (!prisma || !storage) {
      return errorResponse("Chưa cấu hình kho lưu trữ hoặc cơ sở dữ liệu", 503);
    }

    const body = await request.formData();
    const file = body.get("file");
    const title = body.get("title");
    const assetType = file instanceof File && file.type.startsWith("video/") ? "VIDEO" : "IMAGE";

    // Validate required fields
    if (typeof title !== "string" || !title.trim()) {
      return errorResponse("Tiêu đề là bắt buộc", 400);
    }

    if (!(file instanceof File) || file.size === 0) {
      return errorResponse("Vui lòng chọn ảnh hoặc video", 400);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
    const maxSize = assetType === "VIDEO" ? 250 * 1024 * 1024 : 25 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) return errorResponse("Định dạng tệp không được hỗ trợ", 415);
    if (file.size > maxSize) return errorResponse(`Tệp vượt quá giới hạn ${assetType === "VIDEO" ? "250 MB" : "25 MB"}`, 413);

    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    uploadedPath = `${assetType.toLowerCase()}/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${extension}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "archive-media";
    const bytes = await file.arrayBuffer();
    const upload = await storage.storage.from(bucket).upload(uploadedPath, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (upload.error) return errorResponse(`Tải lên kho lưu trữ thất bại: ${upload.error.message}`, 502);

    const { data: publicData } = storage.storage.from(bucket).getPublicUrl(uploadedPath);
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
        description: String(body.get("description") || "").trim() || null,
        story: String(body.get("story") || "").trim() || null,
        keywords: String(body.get("tags") || "").trim() || null,
        displayPrice: String(body.get("displayPrice") || "").replace(/[$,\s]/g, "") || null,
        licenseType: String(body.get("licenseType") || "RIGHTS_MANAGED") as "RIGHTS_MANAGED" | "ROYALTY_FREE" | "EDITORIAL" | "PERSONAL" | "COMMERCIAL",
        originalUrl: publicData.publicUrl,
        thumbnailUrl: publicData.publicUrl,
        previewUrl: publicData.publicUrl,
        fileSize: file.size,
        mimeType: file.type,
        copyrightYear: archiveYear,
        createdAt: archiveDate,
        publishDate,
        publicContactEmail: String(body.get("publicContactEmail") || "").trim() || null,
        publicContactWebsite: String(body.get("publicContactWebsite") || "").trim() || null,
        seoTitle: String(body.get("seoTitle") || "").trim() || null,
        seoDescription: String(body.get("seoDescription") || "").trim() || null,
        country: String(body.get("country") || "").trim() || null,
        city: String(body.get("city") || "").trim() || null,
        location: String(body.get("location") || "").trim() || null,
        views,
        likes,
        ...(imageMetadata ?? {}),
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
    if (uploadedPath) {
      const storage = getSupabaseAdmin();
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || "archive-media";
      await storage?.storage.from(bucket).remove([uploadedPath]);
    }
    console.error("Asset creation error:", error);
    return errorResponse("Không thể tạo tài sản", 500);
  }
}
