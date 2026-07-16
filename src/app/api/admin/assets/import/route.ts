import { NextRequest } from "next/server";
import { protectRoute, errorResponse, successResponse } from "@/lib/auth-middleware";
import { getPrisma } from "@/lib/prisma";
import { getMockAssets } from "@/lib/mock-data";
import { generateSlug } from "@/lib/asset-utils";

export async function POST(request: NextRequest) {
  const auth = protectRoute(request);
  if (!auth.authenticated) return auth.response;

  const prisma = getPrisma();
  if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);

  try {
    const fixtures = getMockAssets();
    let imported = 0;

    for (const fixture of fixtures) {
      const category = await prisma.category.upsert({
        where: { name: fixture.categoryName },
        update: {},
        create: { name: fixture.categoryName, slug: generateSlug(fixture.categoryName) },
      });
      const collection = fixture.collectionName
        ? await prisma.collection.upsert({
            where: { name: fixture.collectionName },
            update: {},
            create: { name: fixture.collectionName, slug: generateSlug(fixture.collectionName) },
          })
        : null;

      await prisma.asset.upsert({
        where: { slug: fixture.slug },
        update: {},
        create: {
          id: fixture.id,
          publicId: fixture.publicId,
          stockId: fixture.stockId,
          slug: fixture.slug,
          type: fixture.type,
          status: fixture.status,
          title: fixture.title,
          subtitle: fixture.subtitle,
          description: fixture.description,
          story: fixture.story,
          imageContent: fixture.imageContent,
          displayPrice: fixture.displayPrice,
          originalUrl: fixture.previewUrl,
          thumbnailUrl: fixture.thumbnailUrl,
          previewUrl: fixture.previewUrl,
          width: fixture.width,
          height: fixture.height,
          resolution: fixture.resolution,
          camera: fixture.camera,
          lens: fixture.lens,
          iso: fixture.iso,
          aperture: fixture.aperture,
          focalLength: fixture.focalLength,
          shutterSpeed: fixture.shutterSpeed,
          duration: fixture.duration,
          fps: fixture.fps,
          codec: fixture.codec,
          country: fixture.country,
          city: fixture.city,
          location: fixture.location,
          copyrightYear: fixture.copyrightYear,
          licenseType: fixture.licenseType as "RIGHTS_MANAGED" | "ROYALTY_FREE" | "EDITORIAL" | "PERSONAL" | "COMMERCIAL",
          publicContactEmail: fixture.publicContactEmail,
          publicContactWebsite: fixture.publicContactWebsite,
          seoTitle: fixture.seoTitle,
          seoDescription: fixture.seoDescription,
          views: fixture.views,
          likes: fixture.likes,
          downloads: fixture.downloads,
          favorites: fixture.favorites,
          popularity: fixture.popularity,
          shootDate: new Date(fixture.shootDate),
          publishDate: new Date(fixture.publishDate),
          createdAt: fixture.createdAt,
          keywords: fixture.tags.join(", "),
          categoryId: category.id,
          collectionId: collection?.id,
          rightsHolders: fixture.rightsHolders?.length
            ? {
                create: fixture.rightsHolders.map((holder, index) => ({
                  name: holder.name,
                  role: holder.role,
                  organization: holder.organization,
                  email: holder.email,
                  website: holder.website,
                  displayOrder: index,
                  isPrimary: index === 0,
                })),
              }
            : undefined,
        },
      });
      imported += 1;
    }

    return successResponse({ imported });
  } catch (error) {
    console.error("Fixture import error:", error);
    return errorResponse("Không thể nhập tài sản mẫu", 500);
  }
}
