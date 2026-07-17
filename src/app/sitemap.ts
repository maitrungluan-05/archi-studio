import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { DEMO_CATEGORIES, DEMO_COLLECTIONS, getMockAssets } from "@/lib/mock-data";
import { getPublishedStories } from "@/lib/story-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/explore", "/images", "/videos", "/collections", "/stories", "/categories", "/about", "/copyright", "/license", "/dmca", "/privacy", "/terms"];
  const staticEntries = staticRoutes.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date("2026-07-16"),
    changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
  const assetEntries = getMockAssets().map((asset) => ({
    url: `${SITE.url}/gallery/${asset.slug}`,
    lastModified: asset.updatedAt ?? asset.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    images: [asset.previewUrl],
  }));
  const taxonomyEntries = [
    ...DEMO_CATEGORIES.map((category) => `/categories/${category.slug}`),
    ...DEMO_COLLECTIONS.map((collection) => `/collections/${collection.slug}`),
  ].map((route) => ({ url: `${SITE.url}${route}`, changeFrequency: "monthly" as const, priority: 0.6 }));
  const stories = await getPublishedStories().catch(() => []);
  const storyEntries = stories.map((story) => ({
    url: `${SITE.url}/stories/${story.slug}`,
    lastModified: story.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    images: story.images[0] ? [story.images[0].url] : undefined,
  }));

  return [...staticEntries, ...assetEntries, ...storyEntries, ...taxonomyEntries];
}
