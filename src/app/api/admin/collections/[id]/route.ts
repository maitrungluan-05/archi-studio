import { NextRequest } from "next/server";
import { protectRoute, errorResponse, successResponse } from "@/lib/auth-middleware";
import { DEMO_COLLECTIONS } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// ============================================================
// Admin Collection Detail Endpoints
// ============================================================
// GET /api/admin/collections/[id]
// PUT /api/admin/collections/[id]
// DELETE /api/admin/collections/[id]
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = protectRoute(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { id } = await params;
    const prisma = getPrisma();
    const collection = prisma
      ? await prisma.collection.findFirst({ where: { OR: [{ id }, { slug: id }] } })
      : DEMO_COLLECTIONS.find((item) => item.id === id || item.slug === id);

    if (!collection) {
      return errorResponse("Không tìm thấy bộ sưu tập", 404);
    }

    return successResponse(collection);
  } catch (error) {
    console.error("Collection detail fetch error:", error);
    return errorResponse("Không thể tải bộ sưu tập", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = protectRoute(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { id } = await params;
    const prisma = getPrisma();
    if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
    const existing = await prisma.collection.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!existing) return errorResponse("Không tìm thấy bộ sưu tập", 404);
    const body = await request.json();
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : existing.name;
    const updated = await prisma.collection.update({
      where: { id: existing.id },
      data: {
        name,
        slug: typeof body.slug === "string" ? slugify(body.slug) : existing.slug,
        description: typeof body.description === "string" ? body.description.trim() || null : existing.description,
        coverImage: typeof body.coverImage === "string" ? body.coverImage : existing.coverImage,
        sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : existing.sortOrder,
      },
    });
    return successResponse(updated);
  } catch (error) {
    console.error("Collection update error:", error);
    return errorResponse("Không thể cập nhật bộ sưu tập", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = protectRoute(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { id } = await params;
    const prisma = getPrisma();
    if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
    const existing = await prisma.collection.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } });
    if (!existing) return errorResponse("Không tìm thấy bộ sưu tập", 404);
    await prisma.collection.delete({ where: { id: existing.id } });

    return successResponse({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Collection deletion error:", error);
    return errorResponse("Không thể xóa bộ sưu tập", 500);
  }
}
