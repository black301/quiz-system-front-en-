import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access")?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

  if (!token && !isAuthPage) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (token && isAuthPage) {
    // If logged in, block access to login/register pages
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Optional: define which routes the middleware should run on
export const config = {
    matcher: ["/((?!_next|.*\\..*|api).*)"]
};
