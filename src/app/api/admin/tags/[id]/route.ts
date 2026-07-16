import { NextRequest } from "next/server";
import { protectRoute, errorResponse, successResponse } from "@/lib/auth-middleware";
import { getMockAssets } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// ============================================================
// Admin Tag Detail Endpoints
// ============================================================
// GET /api/admin/tags/[id]
// PUT /api/admin/tags/[id]
// DELETE /api/admin/tags/[id]
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
    const assets = getMockAssets();

    // Find tag in assets
    const tag = assets
      .flatMap((a) => a.tags || [])
      .find((t) => t.toLowerCase().replace(/\s+/g, "-") === id);

    if (!tag) {
      return errorResponse("Không tìm thấy thẻ", 404);
    }

    const usageCount = assets.filter((a) => a.tags?.includes(tag)).length;

    return successResponse({
      id: tag.toLowerCase().replace(/\s+/g, "-"),
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, "-"),
      usageCount,
    });
  } catch (error) {
    console.error("Tag detail fetch error:", error);
    return errorResponse("Không thể tải thẻ", 500);
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
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return errorResponse("Tên thẻ là bắt buộc", 400);
    }

    const prisma = getPrisma();
    if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
    const existing = await prisma.tag.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } });
    if (!existing) return errorResponse("Không tìm thấy thẻ", 404);
    const name = body.name.trim();
    const tag = await prisma.tag.update({ where: { id: existing.id }, data: { name, slug: typeof body.slug === "string" ? slugify(body.slug) : slugify(name) } });
    return successResponse(tag);
  } catch (error) {
    console.error("Tag update error:", error);
    return errorResponse("Không thể cập nhật thẻ", 500);
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
    const existing = await prisma.tag.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } });
    if (!existing) return errorResponse("Không tìm thấy thẻ", 404);
    await prisma.tag.delete({ where: { id: existing.id } });

    return successResponse({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Tag deletion error:", error);
    return errorResponse("Không thể xóa thẻ", 500);
  }
}
