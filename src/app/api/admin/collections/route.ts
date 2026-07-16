import { NextRequest } from "next/server";
import { protectRoute, errorResponse, paginatedResponse, successResponse } from "@/lib/auth-middleware";
import { validatePagination } from "@/lib/validators";
import { DEMO_COLLECTIONS } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// ============================================================
// Admin Collections List & Create Endpoint
// ============================================================
// GET /api/admin/collections - List collections
// POST /api/admin/collections - Create collection
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
    const search = searchParams.get("search")?.toLowerCase() || "";

    // Validate pagination
    const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);

    // Filter collections
    let collections = DEMO_COLLECTIONS;
    if (search) {
      collections = collections.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search)
      );
    }

    // Calculate pagination
    const total = collections.length;
    const startIndex = (validPage - 1) * validPageSize;
    const endIndex = startIndex + validPageSize;
    const paginatedCollections = collections.slice(startIndex, endIndex);

    return paginatedResponse(paginatedCollections, validPage, validPageSize, total);
  } catch (error) {
    console.error("Collections list error:", error);
    return errorResponse("Không thể tải danh sách bộ sưu tập", 500);
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
      return errorResponse("Tên bộ sưu tập là bắt buộc", 400);
    }

    const prisma = getPrisma();
    if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
    const name = body.name.trim();
    const collection = await prisma.collection.create({
      data: {
        name,
        slug: typeof body.slug === "string" ? slugify(body.slug) : slugify(name),
        description: typeof body.description === "string" ? body.description.trim() || null : null,
        coverImage: typeof body.coverImage === "string" ? body.coverImage : null,
        sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      },
    });

    return successResponse(collection, 201);
  } catch (error) {
    console.error("Collection creation error:", error);
    return errorResponse("Không thể tạo bộ sưu tập", 500);
  }
}
