import { NextRequest } from "next/server";
import { protectRoute, errorResponse, successResponse } from "@/lib/auth-middleware";
import { getMockAssets } from "@/lib/mock-data";

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

    // Return stats
    return successResponse({
      totalAssets,
      totalCollections,
      totalViews,
      averageViews: Math.round(averageViews),
    });
  } catch (error) {
    console.error("Stats endpoint error:", error);
    return errorResponse("Không thể tải thống kê", 500);
  }
}
