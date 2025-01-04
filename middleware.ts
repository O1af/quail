import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const path = request.nextUrl.pathname;

  // Handle app subdomain routing
  if (hostname.startsWith("app.")) {
    // First update the session
    await updateSession(request);

    // Then rewrite the URL to /app path
    return NextResponse.rewrite(
      new URL(`/app${path === "/" ? "" : path}`, request.url),
    );
  }

  // // Default session handling for other routes
  return await updateSession(request);
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
