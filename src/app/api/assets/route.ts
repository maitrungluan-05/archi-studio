import { NextRequest } from "next/server";
import { errorResponse, paginatedResponse } from "@/lib/auth-middleware";
import { validatePagination } from "@/lib/validators";
import { getMockAssets } from "@/lib/mock-data";

// ============================================================
// Public Assets List Endpoint
// ============================================================
// GET /api/assets
// Public route - list published assets
// Query params: page, pageSize, category, search, sort
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase() || "";
    const sort = searchParams.get("sort") || "latest";

    // Validate pagination
    const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);

    // Get mock assets and filter for published only
    let assets = getMockAssets().filter((a) => a.status === "PUBLISHED");

    // Apply category filter
    if (category) {
      assets = assets.filter((a) => a.categoryName?.toLowerCase() === category.toLowerCase());
    }

    // Apply search filter
    if (search) {
      assets = assets.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.description?.toLowerCase().includes(search) ||
          a.tags?.some((t) => t.toLowerCase().includes(search))
      );
    }

    // Apply sorting
    switch (sort) {
      case "popular":
        assets.sort((a, b) => b.views - a.views);
        break;
      case "trending":
        assets.sort((a, b) => b.popularity - a.popularity);
        break;
      case "oldest":
        assets.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
        break;
      case "latest":
      default:
        assets.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    }

    // Calculate pagination
    const total = assets.length;
    const startIndex = (validPage - 1) * validPageSize;
    const endIndex = startIndex + validPageSize;
    const paginatedAssets = assets.slice(startIndex, endIndex);

    // Map to public response (exclude admin-only fields)
    const responseAssets = paginatedAssets.map((asset) => ({
      id: asset.id,
      publicId: asset.publicId,
      slug: asset.slug,
      title: asset.title,
      subtitle: asset.subtitle,
      description: asset.description,
      type: asset.type,
      thumbnailUrl: asset.thumbnailUrl,
      previewUrl: asset.previewUrl,
      views: asset.views,
      likes: asset.likes,
      favorites: asset.favorites,
      tags: asset.tags,
      category: asset.categoryName,
      collection: asset.collectionName,
      publishDate: asset.publishDate,
    }));

    return paginatedResponse(responseAssets, validPage, validPageSize, total);
  } catch (error) {
    console.error("Public assets list error:", error);
    return errorResponse("Failed to fetch assets", 500);
  }
}
