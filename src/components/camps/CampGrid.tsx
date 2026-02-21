'use client';

import { Camp } from '@/types/database';
import CampCard from './CampCard';
import { motion } from 'framer-motion';

interface CampGridProps {
  camps: Camp[];
  loading?: boolean;
  onAddToCalendar?: (camp: Camp) => void;
  onSave?: (camp: Camp) => void;
  onAlertMe?: (camp: Camp) => void;
}

export default function CampGrid({ camps, loading, onAddToCalendar, onSave, onAlertMe }: CampGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CampCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (camps.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏕️</span>
        </div>
        <h3 className="font-display font-bold text-xl text-gray-900 mb-2">
          No camps match your filters
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your filters or search to find more camps.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {camps.map((camp, index) => (
        <CampCard
          key={camp.id}
          camp={camp}
          index={index}
          onAddToCalendar={onAddToCalendar}
          onSave={onSave}
          onAlertMe={onAlertMe}
        />
      ))}
    </div>
  );
}

function CampCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-gray-100 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-100 rounded mb-4" />
      <div className="h-4 w-full bg-gray-100 rounded mb-2" />
      <div className="h-4 w-5/6 bg-gray-100 rounded mb-4" />
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-4 bg-gray-100 rounded" />
        <div className="h-4 bg-gray-100 rounded" />
        <div className="h-4 bg-gray-100 rounded" />
        <div className="h-4 bg-gray-100 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
