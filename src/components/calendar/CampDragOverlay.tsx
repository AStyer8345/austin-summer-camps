'use client';

import { Camp, CATEGORY_CONFIG } from '@/types/database';
import { formatPriceRange } from '@/lib/utils';

interface CampDragOverlayProps {
  camp: Camp;
}

export default function CampDragOverlay({ camp }: CampDragOverlayProps) {
  const config = CATEGORY_CONFIG[camp.category];

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${config.borderColor} ${config.bgColor} shadow-xl cursor-grabbing`}>
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.mapPin }}
      />
      <div>
        <p className={`text-sm font-semibold ${config.color}`}>{camp.name}</p>
        <p className="text-xs text-gray-500">{formatPriceRange(camp.price_min, camp.price_max)}</p>
      </div>
    </div>
  );
}
