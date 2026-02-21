import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const supabase = createServiceRoleClient();

  let query = supabase
    .from('camps')
    .select('*, camp_sessions(*)')
    .eq('is_active', true)
    .order('name');

  // Search
  const search = searchParams.get('search');
  if (search) {
    query = query.or(`name.ilike.%${search}%,notes.ilike.%${search}%,city.ilike.%${search}%,tags.cs.{${search.toLowerCase()}}`);
  }

  // Category filter
  const categories = searchParams.get('categories');
  if (categories) {
    query = query.in('category', categories.split(','));
  }

  // Region filter
  const regions = searchParams.get('regions');
  if (regions) {
    query = query.in('region', regions.split(','));
  }

  // Age filter
  const ageMin = searchParams.get('ageMin');
  const ageMax = searchParams.get('ageMax');
  if (ageMin) {
    query = query.lte('ages_min', parseInt(ageMin));
  }
  if (ageMax) {
    query = query.gte('ages_max', parseInt(ageMax));
  }

  // Price filter
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  if (priceMin) {
    query = query.gte('price_max', parseInt(priceMin));
  }
  if (priceMax) {
    query = query.lte('price_min', parseInt(priceMax));
  }

  // Camp type
  const campType = searchParams.get('campType');
  if (campType && campType !== 'both') {
    query = query.in('camp_type', [campType, 'both']);
  }

  // Schedule type
  const scheduleType = searchParams.get('scheduleType');
  if (scheduleType) {
    query = query.eq('schedule_type', scheduleType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
