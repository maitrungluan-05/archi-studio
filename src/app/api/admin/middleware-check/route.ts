import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("archiv-session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    // Token exists, user is authenticated
    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });
  }
}
