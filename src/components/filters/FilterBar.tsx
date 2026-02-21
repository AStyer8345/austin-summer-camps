'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  CampCategory, CampRegion, CampType, ScheduleType,
  CATEGORY_CONFIG, REGION_CONFIG, CampFilters
} from '@/types/database';

interface FilterBarProps {
  filters: CampFilters;
  onFiltersChange: (filters: CampFilters) => void;
  totalCamps: number;
  filteredCount: number;
}

export default function FilterBar({ filters, onFiltersChange, totalCamps, filteredCount }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof CampFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleCategory = (cat: CampCategory) => {
    const current = filters.categories || [];
    const updated = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    updateFilter('categories', updated.length > 0 ? updated : undefined);
  };

  const toggleRegion = (region: CampRegion) => {
    const current = filters.regions || [];
    const updated = current.includes(region)
      ? current.filter(r => r !== region)
      : [...current, region];
    updateFilter('regions', updated.length > 0 ? updated : undefined);
  };

  const clearAll = () => {
    onFiltersChange({});
  };

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0));

  return (
    <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Search & Quick Filters Row */}
        <div className="py-3 flex flex-col gap-3">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search camps by name, activity, or location..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value || undefined)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-300 focus:ring-2 focus:ring-sky-100 text-sm transition-all outline-none"
              />
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showAdvanced ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Category Quick Filters */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.entries(CATEGORY_CONFIG) as [CampCategory, typeof CATEGORY_CONFIG[CampCategory]][]).map(([key, config]) => {
              const isActive = filters.categories?.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`filter-badge ${
                    isActive
                      ? `${config.bgColor} ${config.color} ring-2 ring-offset-1`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: config.mapPin }}
                  />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of {totalCamps} camps
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-100 pt-3">
                {/* Region Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Region
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(Object.entries(REGION_CONFIG) as [CampRegion, typeof REGION_CONFIG[CampRegion]][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => toggleRegion(key)}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                          filters.regions?.includes(key)
                            ? 'bg-sky-100 text-sky-700 font-medium'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Child&apos;s Age
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={3}
                      max={18}
                      placeholder="Min"
                      value={filters.ageMin || ''}
                      onChange={(e) => updateFilter('ageMin', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      min={3}
                      max={18}
                      placeholder="Max"
                      value={filters.ageMax || ''}
                      onChange={(e) => updateFilter('ageMax', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Budget per Week
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={filters.priceMin || ''}
                      onChange={(e) => updateFilter('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <span className="text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={filters.priceMax || ''}
                      onChange={(e) => updateFilter('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                </div>

                {/* Day/Overnight + Schedule */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Camp Type
                    </label>
                    <div className="flex gap-1">
                      {(['day', 'overnight', 'both'] as CampType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => updateFilter('campType', filters.campType === type ? undefined : type)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg capitalize transition-colors ${
                            filters.campType === type
                              ? 'bg-sky-100 text-sky-700 font-medium'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {type === 'both' ? 'Either' : type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Schedule
                    </label>
                    <div className="flex gap-1">
                      {[
                        { value: 'full_day' as ScheduleType, label: 'Full Day' },
                        { value: 'half_day_am' as ScheduleType, label: 'Half Day' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => updateFilter('scheduleType', filters.scheduleType === value ? undefined : value)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                            filters.scheduleType === value
                              ? 'bg-sky-100 text-sky-700 font-medium'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
