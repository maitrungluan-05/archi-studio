import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// ============================================================
// JWT Payload Type
// ============================================================

export interface JWTPayload {
  email: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

// ============================================================
// Route Protection Types (Discriminated Union)
// ============================================================

export interface ProtectRouteSuccess {
  authenticated: true;
  user: JWTPayload;
  response?: never;
}

export interface ProtectRouteFailure {
  authenticated: false;
  response: NextResponse;
  user?: never;
}

export type ProtectRouteResult = ProtectRouteSuccess | ProtectRouteFailure;

// ============================================================
// Auth Middleware
// ============================================================

/**
 * Verify JWT token from cookie
 * Returns decoded token or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  if (!JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract JWT from request cookies
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "archiv-session" && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Middleware: Protect admin routes
 * Returns { authenticated: true, user: JWTPayload } or error response
 */
export function protectRoute(request: NextRequest): ProtectRouteResult {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: No token provided" },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: Invalid token" },
        { status: 401 }
      ),
    };
  }

  if (payload.role !== "admin") {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden: Admin role required" },
        { status: 403 }
      ),
    };
  }

  return {
    authenticated: true,
    user: payload,
    response: undefined,
  };
}

/**
 * Success response helper
 */
export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code && { code }),
    },
    { status }
  );
}

/**
 * Paginated response helper
 */
export function paginatedResponse(
  items: unknown[],
  page: number,
  pageSize: number,
  total: number,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      data: items,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    },
    { status }
  );
}
