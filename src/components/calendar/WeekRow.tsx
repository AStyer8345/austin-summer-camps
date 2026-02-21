'use client';

import { useDroppable } from '@dnd-kit/core';
import { Camp, CATEGORY_CONFIG } from '@/types/database';
import { formatPriceRange } from '@/lib/utils';
import { X } from 'lucide-react';

interface CalendarEntry {
  weekIndex: number;
  camp: Camp;
}

interface WeekRowProps {
  weekIndex: number;
  weekLabel: string;
  monthLabel: string;
  entries: CalendarEntry[];
  onRemoveEntry: (weekIndex: number, campId: string) => void;
  isOver: boolean;
}

export default function WeekRow({ weekIndex, weekLabel, monthLabel, entries, onRemoveEntry }: WeekRowProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `week-${weekIndex}`,
  });

  const weekCost = entries.reduce((sum, e) => sum + (e.camp.price_min || e.camp.price_max || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex items-stretch rounded-xl border transition-all ${
        isOver
          ? 'border-sky-400 bg-sky-50 shadow-md ring-2 ring-sky-200'
          : entries.length > 0
            ? 'border-gray-200 bg-white'
            : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
      }`}
    >
      {/* Week Label */}
      <div className="w-28 flex-shrink-0 px-3 py-2.5 border-r border-gray-100 flex flex-col justify-center">
        <p className="text-[10px] font-semibold text-gray-400 uppercase">{monthLabel}</p>
        <p className="text-xs font-medium text-gray-700">{weekLabel}</p>
        {weekCost > 0 && (
          <p className="text-[10px] font-medium text-green-600 mt-0.5">${weekCost}</p>
        )}
      </div>

      {/* Camp Slots */}
      <div className="flex-1 px-2 py-2 flex items-center gap-1.5 min-h-[52px] flex-wrap">
        {entries.length === 0 ? (
          <p className={`text-xs ${isOver ? 'text-sky-500 font-medium' : 'text-gray-300'}`}>
            {isOver ? 'Drop camp here!' : 'Drag a camp here...'}
          </p>
        ) : (
          entries.map((entry) => {
            const config = CATEGORY_CONFIG[entry.camp.category];
            return (
              <div
                key={entry.camp.id}
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${config.bgColor} ${config.borderColor} border`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.mapPin }}
                />
                <div className="min-w-0">
                  <p className={`text-xs font-medium ${config.color} truncate max-w-[160px]`}>
                    {entry.camp.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {formatPriceRange(entry.camp.price_min, entry.camp.price_max)}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveEntry(entry.weekIndex, entry.camp.id)}
                  className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-white/50 transition-all"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
