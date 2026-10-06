import { NextRequest, NextResponse } from "next/server";
import { pingServerAction } from "./app/actions";
import { ROUTES, PUBLIC_PATHS } from "./config/constants";

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) return true;
  // /profile/<username> — public user profiles (not /profile itself)
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "profile";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === ROUTES.ROOT) {
    const response = await pingServerAction();
    if (response.success) {
      return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
    }
    return NextResponse.next();
  }

  if (isPublic(pathname)) return NextResponse.next();

  const response = await pingServerAction();

  if (!response.success) {
    const loginUrl = new URL(ROUTES.LOGIN, req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
