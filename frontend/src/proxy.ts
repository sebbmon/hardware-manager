import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🛠️ Funkcja pomocnicza do dekodowania JWT bez zewnętrznych bibliotek
function decodeJwt(token: string) {
    try {
        // Token JWT składa się z 3 części, interesuje nas środkowa (payload)
        const payloadBase64Url = token.split('.')[1];
        // Naprawiamy format Base64Url na standardowy Base64
        const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Dekodujemy Base64 do stringa JSON
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null; // Zwraca null, jeśli token jest uszkodzony
    }
}

export function proxy(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;

    const isAuthPage = request.nextUrl.pathname.startsWith('/login');
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
    // 🔥 Sprawdzamy, czy ktoś pcha się do panelu admina
    const isAdminPage = request.nextUrl.pathname.startsWith('/dashboard/admin');

    // 1. Brak ciasteczka -> Wyrzucamy na login
    if (!token && isDashboard) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Jeśli jest token, sprawdzamy, co w nim siedzi
    if (token) {
        // Zalogowany chce wejść na login -> Wrzucamy do apki
        if (isAuthPage) {
            return NextResponse.redirect(new URL('/dashboard/list', request.url));
        }

        // 🔥 3. TWARDA BLOKADA ADMINA
        if (isAdminPage) {
            const payload = decodeJwt(token);
            // Jeśli token nie ma flagi is_staff = true, bezlitośnie wyrzucamy
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