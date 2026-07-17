import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
}

const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
if (!databaseUrl || !cloudName || !apiKey || !apiSecret) throw new Error("Thiếu cấu hình database hoặc Cloudinary.");

const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
const candidates = [
  ["photo-1470770841072-f978cf4d019e", "Thung lũng trong sương", "Một thung lũng xanh mở ra dưới lớp sương sớm."],
  ["photo-1441974231531-c6227db76b6e", "Lối vào rừng", "Ánh sáng len qua tán cây trên con đường nhỏ."],
  ["photo-1501785888041-af3ef285b470", "Người trước núi", "Một khoảnh khắc tĩnh lặng giữa không gian rộng lớn."],
  ["photo-1472396961693-142e6e269027", "Cánh đồng hoang", "Cỏ dại và đường chân trời trong ánh chiều."],
  ["photo-1469474968028-56623f02e42e", "Dãy núi xa", "Những lớp địa hình nối tiếp nhau đến cuối tầm mắt."],
  ["photo-1426604966848-d7adac402bff", "Mặt hồ tĩnh", "Mặt nước phản chiếu bầu trời và các sườn núi."],
  ["photo-1439853949127-fa647821eba0", "Dòng nước xanh", "Một dải nước xanh chạy giữa địa hình đá."],
  ["photo-1447752875215-b2761acb3c5d", "Rừng sâu", "Nhịp điệu của thân cây, rêu và ánh sáng tự nhiên."],
  ["photo-1500534314209-a25ddb2bd429", "Đường qua cao nguyên", "Con đường nhỏ dẫn mắt người xem vào chiều sâu phong cảnh."],
  ["photo-1500534623283-312aade485b7", "Bờ biển lộng gió", "Sóng, đá và đường bờ gặp nhau trong một khung hình rộng."],
  ["photo-1511497584788-876760111969", "Tán cây mùa xanh", "Các tầng lá tạo nên bề mặt giàu chi tiết."],
  ["photo-1501854140801-50d01698950b", "Nhìn từ trên cao", "Phong cảnh được giản lược thành mảng màu và đường nét."],
];

const uploaded = [];
function signature(params) {
  const value = Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${key}=${item}`).join("&");
  return createHash("sha1").update(value + apiSecret).digest("hex");
}
async function destroy(image) {
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new FormData(); body.set("public_id", image.publicId); body.set("timestamp", String(timestamp)); body.set("api_key", apiKey); body.set("signature", signature({ public_id: image.publicId, timestamp }));
  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: "POST", body });
}

try {
  // Fail before uploading anything when the generated client and database schema are out of sync.
  await prisma.$queryRawUnsafe('SELECT "subtitle" FROM "stories" LIMIT 0');
  const [assets, storyImages] = await Promise.all([prisma.asset.findMany({ select: { originalUrl: true, previewUrl: true, thumbnailUrl: true } }), prisma.storyImage.findMany({ select: { url: true } })]);
  const existingUrls = [...assets.flatMap((item) => [item.originalUrl, item.previewUrl, item.thumbnailUrl]), ...storyImages.map((item) => item.url)].filter(Boolean).join("\n");
  const selected = candidates.filter(([photoId]) => !existingUrls.includes(photoId)).slice(0, 10);
  if (selected.length < 10) throw new Error("Không đủ 10 ảnh ứng viên chưa tồn tại trong DB.");
  for (const [photoId, alt, caption] of selected) {
    const timestamp = Math.floor(Date.now() / 1000); const folder = "archi/stories";
    const body = new FormData(); body.set("file", `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1800&q=82`); body.set("folder", folder); body.set("timestamp", String(timestamp)); body.set("api_key", apiKey); body.set("signature", signature({ folder, timestamp }));
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
    const result = await response.json(); if (!response.ok) throw new Error(result?.error?.message || `Upload thất bại: ${photoId}`);
    uploaded.push({ url: result.secure_url, publicId: result.public_id, alt, caption, width: result.width, height: result.height, fileSize: result.bytes });
    console.log(`Uploaded ${uploaded.length}/10: ${alt}`);
  }
  const baseSlug = "muoi-khung-hinh-giua-thien-nhien";
  const old = await prisma.story.findUnique({ where: { slug: baseSlug }, include: { images: true } });
  if (old) await prisma.story.delete({ where: { id: old.id } });
  const story = await prisma.story.create({ data: {
    title: "Mười khung hình giữa thiên nhiên", subtitle: "Một hành trình từ rừng sâu đến bờ biển", slug: baseSlug,
    excerpt: "Mười cảnh quan khác nhau được nối lại thành một hành trình thị giác chậm rãi qua ánh sáng, địa hình và mặt nước.",
    content: "Bài thử nghiệm này được xây dựng từ mười ảnh chưa xuất hiện trong cơ sở dữ liệu. Ảnh được lưu và phân phối qua Cloudinary; PostgreSQL chỉ giữ URL cùng metadata cần thiết.",
    category: "Nature", tags: "thiên nhiên, phong cảnh, núi, rừng, mặt nước", country: "Nhiều địa điểm", status: "PUBLISHED", licenseType: "EDITORIAL",
    copyrightOwner: "Ảnh mẫu từ Unsplash", views: 0, likes: 0, seoTitle: "Mười khung hình giữa thiên nhiên | ARCHI", seoDescription: "Visual story gồm mười ảnh phong cảnh được phân phối qua Cloudinary.", publishedAt: new Date(),
    images: { create: uploaded.map((image, sortOrder) => ({ url: image.url, path: `cloudinary:image:${image.publicId}`, alt: image.alt, caption: image.caption, width: image.width, height: image.height, fileSize: image.fileSize, sortOrder })) },
  }, include: { images: true } });
  console.log(`Created story: ${story.slug} (${story.images.length} images)`);
} catch (error) {
  await Promise.allSettled(uploaded.map(destroy));
  throw error;
} finally {
  await prisma.$disconnect();
}
