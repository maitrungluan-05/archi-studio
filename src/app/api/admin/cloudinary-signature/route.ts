import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { protectRoute, errorResponse, successResponse } from "@/lib/auth-middleware";

const ALLOWED_FOLDERS = new Set(["archi/assets", "archi/stories"]);

export async function POST(request: NextRequest) {
  const auth = protectRoute(request); if (!auth.authenticated) return auth.response;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return errorResponse("Chưa cấu hình Cloudinary", 503);
  const body = await request.json().catch(() => null);
  const folder = typeof body?.folder === "string" ? body.folder : "";
  if (!ALLOWED_FOLDERS.has(folder)) return errorResponse("Thư mục upload không hợp lệ", 400);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest("hex");
  return successResponse({ cloudName, apiKey, timestamp, signature, folder });
}
