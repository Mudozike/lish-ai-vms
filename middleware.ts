import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/register",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/visitors",
    "/api/hosts",
  ],
  afterAuth(auth, req, evt) {
    const { userId, isPublicRoute } = auth;
    const path = req.nextUrl.pathname;

    // 1. Unauthenticated users trying to access protected paths
    if (!userId && !isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // 2. Authenticated users
    if (userId) {
      // Determine role from metadata or email fallback
      const email = (auth.sessionClaims?.email as string) || "";
      let role = ((auth.sessionClaims?.publicMetadata as any)?.role as string) || "";
      
      if (!role) {
        if (email === 'admin@lishailabs.com') {
          role = 'ADMIN';
        } else if (email === 'security@lishailabs.com') {
          role = 'SECURITY';
        } else {
          role = 'HOST';
        }
      }

      const lowercaseRole = role.toLowerCase();

      // Redirect if visiting generic /dashboard or a wrong dashboard sub-route
      if (path === '/dashboard' || path === '/dashboard/') {
        return NextResponse.redirect(new URL(`/dashboard/${lowercaseRole}`, req.url));
      }

      if (path.startsWith('/dashboard/') && !path.startsWith(`/dashboard/${lowercaseRole}`)) {
        // Prevent access to other dashboards
        return NextResponse.redirect(new URL(`/dashboard/${lowercaseRole}`, req.url));
      }
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
