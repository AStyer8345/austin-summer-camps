'use client';

import { Camp, CampSession, CATEGORY_CONFIG } from '@/types/database';
import { format, parseISO } from 'date-fns';

interface CampDragOverlayProps {
  camp: Camp;
  session?: CampSession;
}

export default function CampDragOverlay({ camp, session }: CampDragOverlayProps) {
  const config = CATEGORY_CONFIG[camp.category];

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${config.borderColor} ${config.bgColor} shadow-xl cursor-grabbing max-w-[280px]`}>
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.mapPin }}
      />
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${config.color} truncate`}>{camp.name}</p>
        {session ? (
          <div>
            <p className="text-xs text-gray-600 truncate">{session.session_name}</p>
            <p className="text-[10px] text-gray-500">
              {format(parseISO(session.start_date), 'MMM d')} - {format(parseISO(session.end_date), 'MMM d')} &middot; ${session.price?.toLocaleString() || '—'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500">${camp.price_min?.toLocaleString() || '—'}/wk</p>
        )}
      </div>
    </div>
  );
}
