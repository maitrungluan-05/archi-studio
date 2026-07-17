import { NextRequest } from "next/server";
import { protectRoute, errorResponse, successResponse } from "@/lib/auth-middleware";
import { getPrisma } from "@/lib/prisma";
import { getMockAssets } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const auth = protectRoute(request); if (!auth.authenticated) return auth.response;
  const prisma = getPrisma(); if (!prisma) return errorResponse("Chưa cấu hình cơ sở dữ liệu", 503);
  try {
    const assets = getMockAssets().filter((asset) => asset.type === "IMAGE").slice(0, 8);
    const data = { title: "Những nhịp sống qua tám khung hình", slug: "nhung-nhip-song-qua-tam-khung-hinh", excerpt: "Một visual essay mẫu đi từ chân dung, kiến trúc đến cảnh quan, cho thấy cách một bài nhiều ảnh vận hành trên ARCHI.", content: "Mỗi bức ảnh giữ một nhịp riêng, nhưng khi đặt cạnh nhau chúng tạo thành một hành trình thị giác liền mạch. Bài mẫu này dùng dữ liệu ảnh có sẵn để kiểm tra bố cục, lazy-loading, caption và thứ tự hiển thị.", status: "PUBLISHED" as const, seoTitle: "Những nhịp sống qua tám khung hình | ARCHI", seoDescription: "Bài story mẫu gồm tám ảnh, dùng để kiểm tra đầy đủ giao diện và hiệu năng của tính năng post nhiều ảnh.", publishedAt: new Date() };
    const existing = await prisma.story.findUnique({ where: { slug: data.slug } });
    if (existing) await prisma.storyImage.deleteMany({ where: { storyId: existing.id } });
    const images = assets.map((asset, sortOrder) => ({ url: asset.previewUrl, path: `sample:${asset.id}`, alt: asset.title, caption: asset.description, width: asset.width, height: asset.height, fileSize: 0, sortOrder }));
    const story = existing ? await prisma.story.update({ where: { id: existing.id }, data: { ...data, images: { create: images } }, include: { images: true } }) : await prisma.story.create({ data: { ...data, images: { create: images } }, include: { images: true } });
    return successResponse(story, existing ? 200 : 201);
  } catch (error) { console.error("Story sample import error:", error); return errorResponse("Không thể tạo story mẫu", 500); }
}
