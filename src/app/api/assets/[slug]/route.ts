import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/auth-middleware";
import { getMockAssetBySlug } from "@/lib/mock-data";

// ============================================================
// Public Asset Detail Endpoint
// ============================================================
// GET /api/assets/[slug]
// Public route - fetch published asset details
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return errorResponse("Slug is required", 400);
    }

    // Get asset by slug
    const asset = getMockAssetBySlug(slug);

    if (!asset) {
      return errorResponse("Asset not found", 404);
    }

    // Check if published
    if (asset.status !== "PUBLISHED") {
      return errorResponse("Asset not available", 403);
    }

    // Return public asset data
    const publicAsset = {
      id: asset.id,
      publicId: asset.publicId,
      slug: asset.slug,
      type: asset.type,
      title: asset.title,
      subtitle: asset.subtitle,
      description: asset.description,
      story: asset.story,
      imageContent: asset.imageContent,
      previewUrl: asset.previewUrl,
      thumbnailUrl: asset.thumbnailUrl,
      width: asset.width,
      height: asset.height,
      resolution: asset.resolution,
      displayPrice: asset.displayPrice,
      camera: asset.camera,
      lens: asset.lens,
      iso: asset.iso,
      aperture: asset.aperture,
      focalLength: asset.focalLength,
      shutterSpeed: asset.shutterSpeed,
      duration: asset.duration,
      fps: asset.fps,
      codec: asset.codec,
      country: asset.country,
      city: asset.city,
      location: asset.location,
      copyrightYear: asset.copyrightYear,
      licenseType: asset.licenseType,
      publicContactEmail: asset.publicContactEmail,
      publicContactWebsite: asset.publicContactWebsite,
      seoTitle: asset.seoTitle,
      seoDescription: asset.seoDescription,
      views: asset.views,
      likes: asset.likes,
      downloads: asset.downloads,
      favorites: asset.favorites,
      tags: asset.tags,
      category: asset.categoryName,
      collection: asset.collectionName,
      shootDate: asset.shootDate,
      publishDate: asset.publishDate,
    };

    return successResponse(publicAsset);
  } catch (error) {
    console.error("Public asset detail error:", error);
    return errorResponse("Failed to fetch asset", 500);
  }
}
