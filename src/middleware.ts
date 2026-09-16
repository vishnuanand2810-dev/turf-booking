import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Only enforce auth for /dashboard and /owner routes
      const path = req.nextUrl.pathname;
      if (path.startsWith("/dashboard") || path.startsWith("/owner")) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/owner/:path*"],
};
