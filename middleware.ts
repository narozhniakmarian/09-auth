import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { checkServerSession } from "./lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkServerSession();
      const setCookie = sessionResponse.headers["set-cookie"];

      if (setCookie) {
        const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
        const response = isAuthRoute
          ? NextResponse.redirect(new URL("/", request.url))
          : NextResponse.next();

        let accessTokenValue: string | undefined;
        let refreshTokenValue: string | undefined;
        let cookieOptions:
          | Parameters<typeof response.cookies.set>[2]
          | undefined;

        for (const cookieStr of cookieArray) {
          const parsed = parse(cookieStr);
          const options = {
            expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
            path: parsed.Path,
            maxAge: Number(parsed["Max-Age"]),
          };

          if (parsed.accessToken) {
            accessTokenValue = parsed.accessToken;
            cookieOptions = options;
            response.cookies.set("accessToken", accessTokenValue, options);
          }

          if (parsed.refreshToken) {
            refreshTokenValue = parsed.refreshToken;
            cookieOptions = options;
            response.cookies.set("refreshToken", refreshTokenValue, options);
          }
        }

        return response;
      }
    } catch (err) {
      console.error("Session refresh failed:", err);
    }
  }

  if (!accessToken && isPrivateRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
