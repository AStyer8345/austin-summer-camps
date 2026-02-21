'use client';

import Header from '@/components/layout/Header';
import SummerCalendar from '@/components/calendar/SummerCalendar';
import { useCamps } from '@/hooks/useCamps';

export default function CalendarPage() {
  const { camps, loading } = useCamps();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="h-4 bg-gray-200 rounded w-96" />
            <div className="space-y-2 mt-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <SummerCalendar camps={camps} />
      )}
    </div>
  );
}
