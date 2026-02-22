'use client';

import { useState } from 'react';
import { Map, LayoutGrid } from 'lucide-react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/layout/HeroSection';
import FilterBar from '@/components/filters/FilterBar';
import CampGrid from '@/components/camps/CampGrid';
import CampMap from '@/components/map/CampMap';
import EmailCaptureBanner from '@/components/email/EmailCaptureBanner';
import { useCamps } from '@/hooks/useCamps';
import { Camp } from '@/types/database';
import toast from 'react-hot-toast';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-az' | 'name-za' | 'age-asc';

function sortCamps(camps: Camp[], sortBy: SortOption): Camp[] {
  const sorted = [...camps];
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.price_min ?? 9999) - (b.price_min ?? 9999));
    case 'price-desc':
      return sorted.sort((a, b) => (b.price_max ?? 0) - (a.price_max ?? 0));
    case 'name-az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-za':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'age-asc':
      return sorted.sort((a, b) => a.ages_min - b.ages_min);
    default:
      return sorted;
  }
}

export default function HomePage() {
  const { filteredCamps, loading, filters, setFilters, totalCount, filteredCount } = useCamps();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const sortedCamps = sortCamps(filteredCamps, sortBy);

  const handleAddToCalendar = (camp: Camp) => {
    toast.success(`${camp.name} added to calendar!`, {
      icon: '📅',
    });
  };

  const handleSave = (camp: Camp) => {
    toast.success(`${camp.name} saved!`, {
      icon: '❤️',
    });
  };

  const handleAlertMe = (camp: Camp) => {
    toast.success(`You'll be notified when ${camp.name} opens registration!`, {
      icon: '🔔',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <HeroSection />

      {/* Browse Section */}
      <div id="browse">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          totalCamps={totalCount}
          filteredCount={filteredCount}
        />

        {/* View Toggle + Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-az">Name A-Z</option>
              <option value="name-za">Name Z-A</option>
              <option value="age-asc">Age: Youngest First</option>
            </select>
          </div>

          {/* Content */}
          {viewMode === 'grid' ? (
            <CampGrid
              camps={sortedCamps}
              loading={loading}
              onAddToCalendar={handleAddToCalendar}
              onSave={handleSave}
              onAlertMe={handleAlertMe}
            />
          ) : (
            <CampMap camps={sortedCamps} />
          )}
        </div>
      </div>

      {/* Email Capture */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <EmailCaptureBanner />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Austin Summer Camp Finder &middot; Helping Austin families plan the perfect summer
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-600 transition-colors">Terms</a>
              <a href="mailto:hello@austincampfinder.com" className="hover:text-gray-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
