import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const grupo_hemmy_auth = request.cookies.get("grupo_hemmy_auth")?.value
  const is_locked = request.cookies.get("is_locked")?.value
  const path = request.nextUrl.pathname

  const excludedPaths = [
    /^\/api/,
    /^\/_next\/static/,
    /^\/_next\/image/,
    /^\/favicon.ico/,
    /\.(png|jpg|jpeg|svg|webp|ico|gif|css|js|woff2?|ttf|otf)$/,
  ]

  if (excludedPaths.some((pattern) => pattern.test(path))) {
    return NextResponse.next()
  }

  if (path === "/login") {
    if (grupo_hemmy_auth) {
      if (is_locked === "true") {
        return NextResponse.redirect(new URL("/lock-screen", request.url))
      }
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  if (path === "/lock-screen") {
    if (!grupo_hemmy_auth) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  if (!grupo_hemmy_auth) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (is_locked === "true" && path !== "/lock-screen") {
    return NextResponse.redirect(new URL("/lock-screen", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/:path*",
}

