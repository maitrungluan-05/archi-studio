import { NextRequest } from "next/server";
import { protectRoute, errorResponse, successResponse } from "@/lib/auth-middleware";
import { getMockAssets } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";

// ============================================================
// Admin Stats Endpoint
// ============================================================
// GET /api/admin/stats
// Protected admin route - returns dashboard statistics
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = protectRoute(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Get mock assets (will use Prisma when database is connected)
    const assets = getMockAssets();

    // Calculate statistics
    const totalAssets = assets.length;
    const totalViews = assets.reduce((sum, asset) => sum + asset.views, 0);
    const averageViews = totalAssets > 0 ? totalViews / totalAssets : 0;

    // Count unique collections
    const collectionsSet = new Set(
      assets.map((asset) => asset.collectionName).filter(Boolean)
    );
    const totalCollections = collectionsSet.size;

    const prisma = getPrisma();
    const storyStats = prisma ? await prisma.story.aggregate({ _count: { id: true }, _sum: { views: true } }) : null;
    const totalFrames = prisma ? await prisma.storyImage.count() : 0;
    const publishedStories = prisma ? await prisma.story.count({ where: { status: "PUBLISHED" } }) : 0;
    return successResponse({
      totalAssets,
      totalCollections,
      totalViews,
      averageViews: Math.round(averageViews),
      totalStories: storyStats?._count.id || 0,
      publishedStories,
      totalFrames,
      storyViews: storyStats?._sum.views || 0,
    });
  } catch (error) {
    console.error("Stats endpoint error:", error);
    return errorResponse("Không thể tải thống kê", 500);
  }
}
