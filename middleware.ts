import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require specific roles
const PROTECTED_ROUTES: Record<string, string> = {
    "/mon-compte": "client",
    "/espace-fournisseur": "fournisseur",
    "/admin": "admin",
};

// Login pages for each role
const LOGIN_PAGES: Record<string, string> = {
    client: "/client/login",
    fournisseur: "/fournisseur/login",
    admin: "/admin/login", // Actually admin login path might be different, let's just make it standard
};

export async function middleware(request: NextRequest) {
    const { supabase, user, supabaseResponse } = await updateSession(request);

    const pathname = request.nextUrl.pathname;

    // Check if current path matches any protected route prefix
    const matchedRoutePrefix = Object.keys(PROTECTED_ROUTES).find((prefix) =>
        pathname.startsWith(prefix)
    );

    if (matchedRoutePrefix) {
        const requiredRole = PROTECTED_ROUTES[matchedRoutePrefix];
        const loginPage = LOGIN_PAGES[requiredRole] || "/client/login";

        // Skip auth check if we're already on the login page for this role
        if (pathname.startsWith(loginPage)) {
            return supabaseResponse;
        }

        // Not authenticated — redirect to login with return URL
        if (!user) {
            const redirectUrl = new URL(loginPage, request.url);
            redirectUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(redirectUrl);
        }

        // Authenticated — check role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== requiredRole) {
            // Role mismatch — redirect to home
            const homeUrl = new URL("/", request.url);
            return NextResponse.redirect(homeUrl);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon file)
         * - Public files (images, icons, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
