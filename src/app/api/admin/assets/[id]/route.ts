import { NextRequest } from "next/server";
import { protectRoute, errorResponse, successResponse } from "@/lib/auth-middleware";
import { getMockAssets } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import { assetUpdateSchema } from "@/lib/validators";

// ============================================================
// Admin Asset Detail Endpoints
// ============================================================
// GET /api/admin/assets/[id] - Fetch single asset
// PUT /api/admin/assets/[id] - Update asset
// DELETE /api/admin/assets/[id] - Delete asset
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
    const asset = prisma
      ? await prisma.asset.findFirst({ where: { OR: [{ id }, { slug: id }] }, include: { rightsHolders: true, category: true, collection: true } })
      : getMockAssets().find((item) => item.id === id || item.slug === id);

    if (!asset) {
      return errorResponse("Không tìm thấy tài sản", 404);
    }

    return successResponse(asset);
  } catch (error) {
    console.error("Asset detail fetch error:", error);
    return errorResponse("Không thể tải tài sản", 500);
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
    const existing = await prisma.asset.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } });
    if (!existing) return errorResponse("Không tìm thấy tài sản", 404);
    const parsed = assetUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message || "Dữ liệu cập nhật không hợp lệ", 400);
    const { copyrightOwner, archiveDate, ...assetData } = parsed.data;
    const updated = await prisma.$transaction(async (tx) => {
      const savedAsset = await tx.asset.update({
        where: { id: existing.id },
        data: {
          ...assetData,
          ...(archiveDate ? { createdAt: archiveDate, copyrightYear: archiveDate.getUTCFullYear() } : {}),
        },
      });
      if (copyrightOwner) {
        const owner = await tx.rightsHolder.findFirst({
          where: { assetId: existing.id, role: "COPYRIGHT_OWNER" },
          orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }],
        });
        if (owner) {
          await tx.rightsHolder.update({ where: { id: owner.id }, data: { name: copyrightOwner, isPrimary: true, isPublic: true } });
        } else {
          await tx.rightsHolder.create({
            data: { assetId: existing.id, name: copyrightOwner, role: "COPYRIGHT_OWNER", isPrimary: true, isPublic: true },
          });
        }
      }
      return savedAsset;
    });
    return successResponse(updated);
  } catch (error) {
    console.error("Asset update error:", error);
    return errorResponse("Không thể cập nhật tài sản", 500);
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
    const existing = await prisma.asset.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } });
    if (!existing) return errorResponse("Không tìm thấy tài sản", 404);
    await prisma.asset.delete({ where: { id: existing.id } });

    return successResponse({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Asset deletion error:", error);
    return errorResponse("Không thể xóa tài sản", 500);
  }
}
