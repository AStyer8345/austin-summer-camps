import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server');
      const supabase = createServerSupabaseClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // Supabase not configured
    }
  }

  return NextResponse.redirect(new URL('/', request.url));
}
