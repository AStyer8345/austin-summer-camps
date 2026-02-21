'use client';

import { useDraggable } from '@dnd-kit/core';
import { Camp, CATEGORY_CONFIG } from '@/types/database';
import { formatPriceRange, formatAgeRange } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface DraggableCampCardProps {
  camp: Camp;
}

export default function DraggableCampCard({ camp }: DraggableCampCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: camp.id,
  });

  const config = CATEGORY_CONFIG[camp.category];

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-start gap-2 px-2 py-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'opacity-50 border-sky-300 bg-sky-50 shadow-lg'
          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
      }`}
    >
      <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 mb-0.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.mapPin }}
          />
          <span className="text-[10px] text-gray-400">{config.label}</span>
        </div>
        <p className="text-xs font-medium text-gray-900 truncate">{camp.name}</p>
        <p className="text-[10px] text-gray-500">
          {formatAgeRange(camp.ages_min, camp.ages_max)} &middot; {formatPriceRange(camp.price_min, camp.price_max)}
        </p>
      </div>
    </div>
  );
}
