import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  if (hostname.startsWith("credentials.")) {
    if (pathname === "/" || pathname.startsWith("/credentials")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/" ? "/credentials" : pathname;
      return NextResponse.rewrite(url);
    }
  }

  if (hostname.startsWith("onboarding.")) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
