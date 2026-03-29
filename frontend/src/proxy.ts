import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// helper function to decode JWT without external libraries
function decodeJwt(token: string) {
    try {
        // JWT token consists of 3 parts, we are interested in the middle one (payload)
        const payloadBase64Url = token.split('.')[1];
        // fixing base64url format to standard base64
        const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
        // decoding base64 to json string
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null; // returns null if token is corrupted
    }
}

export function proxy(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;

    const isAuthPage = request.nextUrl.pathname.startsWith('/login');
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
    // checking if someone is trying to enter the admin panel
    const isAdminPage = request.nextUrl.pathname.startsWith('/dashboard/admin');

    // 1. No cookie -> redirect to login
    if (!token && isDashboard) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. If there is a token, we check what's inside it
    if (token) {
        // Logged in user wants to enter the login page -> redirect to the app
        if (isAuthPage) {
            return NextResponse.redirect(new URL('/dashboard/list', request.url));
        }

        // 3. HARD BLOCKADE FOR ADMIN
        if (isAdminPage) {
            const payload = decodeJwt(token);
            // If the token doesn't have the is_staff = true flag, we redirect them
            if (!payload || payload.is_staff !== true) {
                return NextResponse.redirect(new URL('/dashboard/list', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};