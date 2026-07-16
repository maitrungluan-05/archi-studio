import { NextRequest, NextResponse } from "next/server";
import { getMockAssets } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.toLowerCase() || "";
  const category = searchParams.get("category")?.toLowerCase();
  const type = searchParams.get("type")?.toLowerCase();

  let assets = getMockAssets();

  if (query) {
    assets = assets.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  if (category) {
    assets = assets.filter(
      (a) => a.categoryName.toLowerCase() === category
    );
  }

  if (type && (type === "image" || type === "video")) {
    assets = assets.filter((a) => a.type === type.toUpperCase());
  }

  return NextResponse.json(assets);
}
