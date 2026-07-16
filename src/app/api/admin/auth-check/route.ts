import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json({ error: "Chưa cấu hình xác thực" }, { status: 503 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("archiv-session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, email: decoded.email });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ" }, { status: 401 });
  }
}
