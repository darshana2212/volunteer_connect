import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtectedArea =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/volunteer') ||
    pathname.startsWith('/ngo') ||
    pathname.startsWith('/sponsor') ||
    pathname.startsWith('/pending') ||
    pathname.startsWith('/rejected');

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Unauthenticated access check
  if (!user) {
    if (isProtectedArea) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Fetch user profile to check role and status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Profile not found yet (could be creating)
    if (isAuthPage) return supabaseResponse;
    return supabaseResponse;
  }

  const role = profile.role;
  const status = profile.status;

  // Handle pending or rejected status
  if (status === 'pending' && role !== 'admin') {
    if (!pathname.startsWith('/pending') && !isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/pending';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (status === 'rejected') {
    if (!pathname.startsWith('/rejected') && !isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/rejected';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // If user is already logged in & approved, redirect away from auth pages
  if (isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${role}/dashboard`;
    return NextResponse.redirect(url);
  }

  // Role-based route enforcement
  if (pathname.startsWith('/admin') && role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = `/${role}/dashboard`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/volunteer') && role !== 'volunteer') {
    const url = request.nextUrl.clone();
    url.pathname = `/${role}/dashboard`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/ngo') && role !== 'ngo') {
    const url = request.nextUrl.clone();
    url.pathname = `/${role}/dashboard`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/sponsor') && role !== 'sponsor') {
    const url = request.nextUrl.clone();
    url.pathname = `/${role}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
