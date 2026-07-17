import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

const storyListSelect = {
  id: true, title: true, slug: true, excerpt: true, status: true,
  publishedAt: true, createdAt: true, updatedAt: true,
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  _count: { select: { images: true } },
} satisfies Prisma.StorySelect;

export async function getPublishedStories() {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.story.findMany({
    where: { status: "PUBLISHED", images: { some: {} } },
    select: storyListSelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPublishedStory(slug: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.story.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}
