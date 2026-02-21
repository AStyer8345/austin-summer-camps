'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Camp, CampFilters } from '@/types/database';

// Sample data for development (works without Supabase)
import { SAMPLE_CAMP_DATA } from '@/lib/sample-data';

export function useCamps() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CampFilters>({});

  useEffect(() => {
    loadCamps();
  }, []);

  async function loadCamps() {
    setLoading(true);
    try {
      // Try API first (requires Supabase)
      const res = await fetch('/api/camps');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCamps(data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load camps');
    }

    // Fallback to sample data
    setCamps(SAMPLE_CAMP_DATA);
    setLoading(false);
  }

  const filteredCamps = useMemo(() => {
    let result = [...camps];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.city.toLowerCase().includes(search) ||
        c.notes?.toLowerCase().includes(search) ||
        c.tags?.some(t => t.toLowerCase().includes(search))
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(c => filters.categories!.includes(c.category));
    }

    if (filters.regions && filters.regions.length > 0) {
      result = result.filter(c => filters.regions!.includes(c.region));
    }

    if (filters.ageMin !== undefined) {
      result = result.filter(c => c.ages_min <= filters.ageMin!);
    }

    if (filters.ageMax !== undefined) {
      result = result.filter(c => c.ages_max >= filters.ageMax!);
    }

    if (filters.priceMin !== undefined) {
      result = result.filter(c => (c.price_max ?? 0) >= filters.priceMin!);
    }

    if (filters.priceMax !== undefined) {
      result = result.filter(c => (c.price_min ?? 0) <= filters.priceMax!);
    }

    if (filters.campType && filters.campType !== 'both') {
      result = result.filter(c => c.camp_type === filters.campType || c.camp_type === 'both');
    }

    if (filters.scheduleType) {
      result = result.filter(c => c.schedule_type === filters.scheduleType);
    }

    return result;
  }, [camps, filters]);

  return {
    camps,
    filteredCamps,
    loading,
    error,
    filters,
    setFilters,
    totalCount: camps.length,
    filteredCount: filteredCamps.length,
  };
}
