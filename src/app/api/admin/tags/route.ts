import { NextRequest } from "next/server";
import { protectRoute, errorResponse, paginatedResponse, successResponse } from "@/lib/auth-middleware";
import { validatePagination } from "@/lib/validators";
import { getMockAssets } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// ============================================================
// Admin Tags List & Create Endpoint
// ============================================================
// GET /api/admin/tags - List all tags
// POST /api/admin/tags - Create new tag
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
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const search = searchParams.get("search")?.toLowerCase() || "";

    // Validate pagination
    const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);

    const prisma = getPrisma();
    if (prisma) {
      const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
      const [tags, total] = await Promise.all([
        prisma.tag.findMany({ where, skip: (validPage - 1) * validPageSize, take: validPageSize, include: { _count: { select: { assets: true } } }, orderBy: { name: "asc" } }),
        prisma.tag.count({ where }),
      ]);
      return paginatedResponse(tags.map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug, usageCount: tag._count.assets })), validPage, validPageSize, total);
    }

    // Extract all unique tags from assets
    const assets = getMockAssets();
    const tagsSet = new Set<string>();
    
    assets.forEach((asset) => {
      if (asset.tags && Array.isArray(asset.tags)) {
        asset.tags.forEach((tag) => tagsSet.add(tag));
      }
    });

    let tags = Array.from(tagsSet)
      .map((tag) => ({
        id: tag.toLowerCase().replace(/\s+/g, "-"),
        name: tag,
        slug: tag.toLowerCase().replace(/\s+/g, "-"),
        usageCount: assets.filter((a) => a.tags?.includes(tag)).length,
      }))
      .sort((a, b) => b.usageCount - a.usageCount);

    // Apply search filter
    if (search) {
      tags = tags.filter((t) => t.name.toLowerCase().includes(search));
    }

    // Calculate pagination
    const total = tags.length;
    const startIndex = (validPage - 1) * validPageSize;
    const endIndex = startIndex + validPageSize;
    const paginatedTags = tags.slice(startIndex, endIndex);

    return paginatedResponse(paginatedTags, validPage, validPageSize, total);
  } catch (error) {
    console.error("Tags list error:", error);
    return errorResponse("Không thể tải danh sách thẻ", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = protectRoute(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return errorResponse("Tên thẻ là bắt buộc", 400);
    }

    const prisma = getPrisma();
    if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
    const name = body.name.trim();
    const tag = await prisma.tag.create({ data: { name, slug: typeof body.slug === "string" ? slugify(body.slug) : slugify(name) } });
    return successResponse(tag, 201);
  } catch (error) {
    console.error("Tag creation error:", error);
    return errorResponse("Không thể tạo thẻ", 500);
  }
}
