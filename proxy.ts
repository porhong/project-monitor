import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const PUBLIC_PATHS = ["/sign-in", "/sign-up"]
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth.api.getSession({ headers: request.headers })
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  if (!session) {
    if (isPublicPath) return NextResponse.next()
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|sitemap.xml|robots.txt).*)"],
}
