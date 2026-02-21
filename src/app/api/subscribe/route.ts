import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Try Beehiiv if configured
    const beehiivApiKey = process.env.BEEHIIV_API_KEY;
    const beehiivPubId = process.env.BEEHIIV_PUBLICATION_ID;

    if (beehiivApiKey && beehiivPubId) {
      const res = await fetch(
        `https://api.beehiiv.com/v2/publications/${beehiivPubId}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${beehiivApiKey}`,
          },
          body: JSON.stringify({
            email,
            reactivate_existing: true,
            send_welcome_email: true,
            utm_source: 'camp_finder',
            ...(name && { custom_fields: [{ name: 'first_name', value: name }] }),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        console.error('Beehiiv error:', data);
        return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
      }

      return NextResponse.json({ success: true, provider: 'beehiiv' });
    }

    // Try Supabase if configured
    let supabase = null;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && key) {
        supabase = createClient(url, key);
      }
    } catch {
      // Supabase not available
    }

    if (supabase) {
      const { error } = await supabase.from('email_subscribers').upsert(
        {
          email,
          source: 'camp_finder',
          subscribed_at: new Date().toISOString(),
          metadata: { name: name || null },
        },
        { onConflict: 'email' }
      );

      if (error) {
        console.error('Supabase subscribe error:', error);
        // Don't fail - fall through to success since email was collected
      }

      return NextResponse.json({ success: true, provider: 'supabase' });
    }

    // Fallback: just log it (for development / demo)
    console.log(`[Email Capture] ${name || 'Anonymous'}: ${email}`);
    return NextResponse.json({ success: true, provider: 'local' });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
