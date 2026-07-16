import type { Prisma } from "@prisma/client";
import { getMockAssets, type MockAsset, type MockRightsHolderRole } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import { generateImageMetadata } from "@/lib/asset-utils";

const assetInclude = {
  category: true,
  collection: true,
  tags: { include: { tag: true } },
  rightsHolders: { where: { isPublic: true }, orderBy: { displayOrder: "asc" as const } },
} satisfies Prisma.AssetInclude;

type GalleryRecord = Prisma.AssetGetPayload<{ include: typeof assetInclude }>;

function toGalleryAsset(asset: GalleryRecord): MockAsset {
  const previewUrl = asset.previewUrl ?? asset.thumbnailUrl ?? asset.originalUrl ?? "";
  const generatedMetadata = asset.type === "IMAGE" ? generateImageMetadata(asset.id) : null;
  const visibleRoles: MockRightsHolderRole[] = ["COPYRIGHT_OWNER", "AUTHORIZED_REPRESENTATIVE", "ARCHIVE_CUSTODIAN"];
  return {
    id: asset.id, publicId: asset.publicId, stockId: asset.stockId, slug: asset.slug ?? asset.id,
    type: asset.type, status: asset.status, title: asset.title, subtitle: asset.subtitle ?? undefined,
    description: asset.description ?? "", story: asset.story ?? undefined, imageContent: asset.imageContent ?? undefined,
    seoTitle: asset.seoTitle ?? undefined, seoDescription: asset.seoDescription ?? undefined,
    displayPrice: asset.displayPrice ?? "", thumbnailUrl: asset.thumbnailUrl ?? previewUrl, previewUrl,
    width: asset.width ?? generatedMetadata?.width ?? 1600, height: asset.height ?? generatedMetadata?.height ?? 1200,
    resolution: asset.resolution ?? (asset.width && asset.height ? `${asset.width} x ${asset.height}` : generatedMetadata?.resolution ?? "Not specified"),
    camera: asset.camera ?? generatedMetadata?.camera, lens: asset.lens ?? generatedMetadata?.lens, iso: asset.iso ?? generatedMetadata?.iso,
    aperture: asset.aperture ?? generatedMetadata?.aperture, focalLength: asset.focalLength ?? generatedMetadata?.focalLength,
    shutterSpeed: asset.shutterSpeed ?? generatedMetadata?.shutterSpeed, country: asset.country ?? undefined,
    city: asset.city ?? undefined, location: asset.location ?? undefined,
    copyrightOwner: asset.rightsHolders.find((holder) => holder.role === "COPYRIGHT_OWNER")?.name ?? "Unknown owner",
    copyrightYear: asset.createdAt.getUTCFullYear(), licenseType: asset.licenseType,
    publicContactEmail: asset.publicContactEmail ?? undefined, publicContactWebsite: asset.publicContactWebsite ?? undefined,
    rightsHolders: asset.rightsHolders.filter((holder) => visibleRoles.includes(holder.role as MockRightsHolderRole)).map((holder) => ({
      name: holder.name, role: holder.role as MockRightsHolderRole, organization: holder.organization ?? undefined,
      email: holder.email ?? undefined, website: holder.website ?? undefined,
    })),
    views: asset.views, likes: asset.likes, downloads: asset.downloads, favorites: asset.favorites,
    popularity: asset.popularity, shootDate: asset.shootDate?.toISOString() ?? "",
    publishDate: asset.publishDate?.toISOString() ?? asset.createdAt.toISOString(), createdAt: asset.createdAt,
    updatedAt: asset.updatedAt, categoryName: asset.category?.name ?? "Uncategorized",
    collectionName: asset.collection?.name ?? undefined, tags: asset.tags.map(({ tag }) => tag.name),
    duration: asset.duration ?? undefined, fps: asset.fps ?? undefined, codec: asset.codec ?? undefined,
  };
}

export async function getPublishedGalleryAssets(): Promise<MockAsset[]> {
  const fallback = () => getMockAssets().filter((asset) => asset.status === "PUBLISHED");
  const prisma = getPrisma();
  if (!prisma) return fallback();
  try {
    const assets = await prisma.asset.findMany({ where: { status: "PUBLISHED" }, include: assetInclude, orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }] });
    const databaseAssets = assets.map(toGalleryAsset);
    const databaseIds = new Set(databaseAssets.flatMap((asset) => [asset.id, asset.slug, asset.publicId]));
    return [...databaseAssets, ...fallback().filter((asset) => !databaseIds.has(asset.id) && !databaseIds.has(asset.slug) && !databaseIds.has(asset.publicId))];
  } catch (error) {
    console.error("Gallery list database lookup failed; using mock fallback:", error);
    return fallback();
  }
}
