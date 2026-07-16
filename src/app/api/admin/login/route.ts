import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function cleanEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const quote = trimmed[0];
  return (quote === '"' || quote === "'") && trimmed.at(-1) === quote
    ? trimmed.slice(1, -1)
    : trimmed;
}

const JWT_SECRET = cleanEnvValue(process.env.JWT_SECRET);
const ADMIN_EMAIL = cleanEnvValue(process.env.ARCHI_ADMIN_EMAIL)?.toLowerCase();
const ADMIN_PASSWORD_HASH = cleanEnvValue(process.env.ARCHI_ADMIN_PASSWORD_HASH)?.replace(/\\\$/g, "$");

export async function POST(request: NextRequest) {
  try {
    if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
      return NextResponse.json({ error: "Chưa cấu hình xác thực" }, { status: 503 });
    }

    const { email, password, rememberMe = false } = await request.json();

    if (typeof email !== "string" || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Vui lòng nhập email và mật khẩu hợp lệ" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    const token = jwt.sign({ email: normalizedEmail, role: "admin" }, JWT_SECRET, {
      expiresIn: rememberMe ? "30d" : "8h",
    });

    const cookieStore = await cookies();
    cookieStore.set("archiv-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
