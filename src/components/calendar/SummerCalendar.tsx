'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Camp, CampSession, CATEGORY_CONFIG } from '@/types/database';
import { getSummerWeeks, formatPriceRange } from '@/lib/utils';
import { format, parseISO, isWithinInterval, startOfWeek } from 'date-fns';
import { Search, DollarSign, Trash2, Download, ChevronRight, ChevronDown, Calendar, MapPin, Clock, Users } from 'lucide-react';
import WeekRow from './WeekRow';
import CampDragOverlay from './CampDragOverlay';

interface SessionCalendarEntry {
  weekIndex: number;
  camp: Camp;
  session: CampSession;
}

interface SummerCalendarProps {
  camps: Camp[];
}

export default function SummerCalendar({ camps }: SummerCalendarProps) {
  const [entries, setEntries] = useState<SessionCalendarEntry[]>([]);
  const [activeDragSession, setActiveDragSession] = useState<{ camp: Camp; session: CampSession } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCampId, setExpandedCampId] = useState<string | null>(null);

  const weeks = useMemo(() => getSummerWeeks(2026), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Filter camps for sidebar
  const filteredCamps = useMemo(() => {
    let result = [...camps];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.category.toLowerCase().includes(s) ||
        c.city.toLowerCase().includes(s) ||
        c.tags?.some(t => t.toLowerCase().includes(s)) ||
        c.sessions?.some(sess => sess.session_name?.toLowerCase().includes(s))
      );
    }
    if (selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }
    return result;
  }, [camps, searchTerm, selectedCategory]);

  // Auto-expand camp when search narrows to few results
  useMemo(() => {
    if (filteredCamps.length === 1 && filteredCamps[0].id !== expandedCampId) {
      setExpandedCampId(filteredCamps[0].id);
    }
  }, [filteredCamps, expandedCampId]);

  // Calculate total cost from sessions
  const totalCost = useMemo(() => {
    return entries.reduce((sum, entry) => {
      return sum + (entry.session.price || entry.camp.price_min || 0);
    }, 0);
  }, [entries]);

  // Get entries for a specific week
  const getWeekEntries = useCallback((weekIndex: number) => {
    return entries.filter(e => e.weekIndex === weekIndex);
  }, [entries]);

  // Find which week index a session's start_date falls into
  const getWeekIndexForDate = useCallback((dateStr: string): number => {
    const date = parseISO(dateStr);
    for (let i = 0; i < weeks.length; i++) {
      if (isWithinInterval(date, { start: weeks[i].start, end: weeks[i].end }) ||
          format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd') === format(weeks[i].start, 'yyyy-MM-dd')) {
        return i;
      }
    }
    return -1;
  }, [weeks]);

  // Check if a session is already scheduled in a week
  const isSessionScheduled = useCallback((weekIndex: number, sessionId: string) => {
    return entries.some(e => e.weekIndex === weekIndex && e.session.id === sessionId);
  }, [entries]);

  const handleDragStart = (event: DragStartEvent) => {
    const sessionId = String(event.active.id);
    for (const camp of camps) {
      const session = camp.sessions?.find(s => s.id === sessionId);
      if (session) {
        setActiveDragSession({ camp, session });
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragSession(null);
    const { active, over } = event;
    if (!over) return;

    const sessionId = String(active.id);
    const weekIndex = parseInt(String(over.id).replace('week-', ''));
    if (isNaN(weekIndex)) return;

    let foundCamp: Camp | null = null;
    let foundSession: CampSession | null = null;
    for (const camp of camps) {
      const session = camp.sessions?.find(s => s.id === sessionId);
      if (session) {
        foundCamp = camp;
        foundSession = session;
        break;
      }
    }
    if (!foundCamp || !foundSession) return;
    if (isSessionScheduled(weekIndex, sessionId)) return;

    setEntries(prev => [...prev, { weekIndex, camp: foundCamp!, session: foundSession! }]);
  };

  const quickAddSession = useCallback((camp: Camp, session: CampSession) => {
    const weekIndex = getWeekIndexForDate(session.start_date);
    if (weekIndex === -1) return;
    if (isSessionScheduled(weekIndex, session.id)) return;
    setEntries(prev => [...prev, { weekIndex, camp, session }]);
  }, [getWeekIndexForDate, isSessionScheduled]);

  const removeEntry = useCallback((weekIndex: number, sessionId: string) => {
    setEntries(prev => prev.filter(e => !(e.weekIndex === weekIndex && e.session.id === sessionId)));
  }, []);

  const clearAll = () => setEntries([]);

  const formatSessionDates = (session: CampSession) => {
    const start = parseISO(session.start_date);
    const end = parseISO(session.end_date);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Summer Calendar Planner</h2>
        <p className="text-sm text-gray-500 mt-1">
          Search for camps, browse their sessions, and drag them onto your calendar.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 items-start">
          {/* Calendar Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-400">|</div>
                <div className="text-sm text-gray-500">
                  {entries.length} session{entries.length !== 1 ? 's' : ''} across {new Set(entries.map(e => e.weekIndex)).size} week{new Set(entries.map(e => e.weekIndex)).size !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  disabled={entries.length === 0}
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
                <button
                  className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors"
                  disabled={entries.length === 0}
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {weeks.map((week, index) => (
                <WeekRow
                  key={index}
                  weekIndex={index}
                  weekLabel={week.label}
                  monthLabel={format(week.start, 'MMM')}
                  entries={getWeekEntries(index)}
                  onRemoveEntry={removeEntry}
                  isOver={false}
                />
              ))}
            </div>
          </div>

          {/* Camp Sidebar with Session Browser */}
          <div className="w-80 flex-shrink-0 sticky top-20 hidden lg:block">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-[calc(100vh-120px)] flex flex-col">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  Find Camps & Sessions
                </h3>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by camp name, city, or theme..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-sky-300 focus:ring-1 focus:ring-sky-100 outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      !selectedCategory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        selectedCategory === key
                          ? `${config.bgColor} ${config.color}`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                {filteredCamps.map((camp) => {
                  const config = CATEGORY_CONFIG[camp.category];
                  const isExpanded = expandedCampId === camp.id;
                  const sessions = camp.sessions || [];
                  const scheduledCount = entries.filter(e => e.camp.id === camp.id).length;

                  return (
                    <div key={camp.id} className="border-b border-gray-50 last:border-0">
                      <button
                        onClick={() => setExpandedCampId(isExpanded ? null : camp.id)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                          isExpanded ? 'bg-sky-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-sky-500" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: config.mapPin }}
                              />
                              <span className="text-[10px] text-gray-400 font-medium">{config.label}</span>
                              {scheduledCount > 0 && (
                                <span className="text-[9px] bg-sky-100 text-sky-600 px-1 py-0.5 rounded font-medium">
                                  {scheduledCount} added
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-900 truncate">{camp.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {camp.city}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {formatPriceRange(camp.price_min, camp.price_max)}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {sessions.length} wk{sessions.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {isExpanded && sessions.length > 0 && (
                        <div className="bg-gray-50/70 px-3 pb-2">
                          <div className="space-y-1">
                            {sessions.map((session) => {
                              const weekIdx = getWeekIndexForDate(session.start_date);
                              const isScheduled = weekIdx >= 0 && isSessionScheduled(weekIdx, session.id);
                              return (
                                <DraggableSessionCard
                                  key={session.id}
                                  camp={camp}
                                  session={session}
                                  isScheduled={isScheduled}
                                  onQuickAdd={() => quickAddSession(camp, session)}
                                  formatDates={formatSessionDates}
                                />
                              );
                            })}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200/50 space-y-1">
                            {camp.notes && (
                              <p className="text-[10px] text-gray-500 leading-relaxed">{camp.notes}</p>
                            )}
                            {camp.website && (
                              <a href={camp.website} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-sky-600 hover:text-sky-700 font-medium">
                                Visit Website &rarr;
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredCamps.length === 0 && (
                  <div className="text-center py-8 px-4">
                    <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No camps match your search</p>
                    <p className="text-[10px] text-gray-300 mt-1">Try a different name or category</p>
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[10px] text-gray-400 text-center">
                  {filteredCamps.length} camps &middot; {filteredCamps.reduce((n, c) => n + (c.sessions?.length || 0), 0)} sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile camp browser */}
        <div className="lg:hidden mt-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Browse Camps & Sessions</h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search camps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sky-300 outline-none"
                />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredCamps.map((camp) => {
                const config = CATEGORY_CONFIG[camp.category];
                const isExpanded = expandedCampId === camp.id;
                const sessions = camp.sessions || [];
                return (
                  <div key={camp.id} className="border-b border-gray-50">
                    <button
                      onClick={() => setExpandedCampId(isExpanded ? null : camp.id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-sky-500" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.mapPin }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{camp.name}</p>
                          <p className="text-xs text-gray-500">{camp.city} &middot; {sessions.length} sessions</p>
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="bg-gray-50/70 px-3 pb-3 space-y-1.5">
                        {sessions.map((session) => {
                          const weekIdx = getWeekIndexForDate(session.start_date);
                          const isScheduled = weekIdx >= 0 && isSessionScheduled(weekIdx, session.id);
                          return (
                            <div key={session.id} className={`bg-white rounded-lg border p-2.5 ${isScheduled ? 'border-green-200' : 'border-gray-200'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-semibold text-gray-800">{session.session_name}</p>
                                  <p className="text-[10px] text-gray-500">{formatSessionDates(session)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold">${session.price}</p>
                                  {isScheduled ? (
                                    <span className="text-[10px] text-green-600">Added ✓</span>
                                  ) : (
                                    <button onClick={() => quickAddSession(camp, session)} className="text-[10px] text-sky-600 font-medium">
                                      + Add
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeDragSession && <CampDragOverlay camp={activeDragSession.camp} session={activeDragSession.session} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Draggable Session Card
function DraggableSessionCard({
  camp,
  session,
  isScheduled,
  onQuickAdd,
  formatDates,
}: {
  camp: Camp;
  session: CampSession;
  isScheduled: boolean;
  onQuickAdd: () => void;
  formatDates: (s: CampSession) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    disabled: isScheduled || session.is_sold_out,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative rounded-lg border p-2 transition-all ${
        isDragging
          ? 'opacity-50 border-sky-300 bg-sky-50 shadow-lg z-50'
          : isScheduled
            ? 'border-green-200 bg-green-50/50 opacity-70'
            : session.is_sold_out
              ? 'border-red-100 bg-red-50/30 opacity-60 cursor-not-allowed'
              : 'border-gray-200 bg-white hover:border-sky-200 hover:shadow-sm cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-gray-800 truncate" title={camp.name}>
            {session.session_name || 'Camp Session'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
            <span className="text-[10px] text-gray-500">{formatDates(session)}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {session.start_time && (
              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {session.start_time}-{session.end_time}
              </span>
            )}
            {session.spots_remaining !== null && !session.is_sold_out && (
              <span className={`text-[10px] flex items-center gap-0.5 ${
                session.spots_remaining < 5 ? 'text-amber-600 font-medium' : 'text-gray-400'
              }`}>
                <Users className="w-2.5 h-2.5" />
                {session.spots_remaining} left
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-bold text-gray-900">
            ${session.price?.toLocaleString() || '—'}
          </p>
          {isScheduled ? (
            <span className="text-[9px] text-green-600 font-medium">Added ✓</span>
          ) : session.is_sold_out ? (
            <span className="text-[9px] text-red-500 font-medium">Sold Out</span>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickAdd(); }}
              className="text-[9px] text-sky-600 hover:text-sky-700 font-medium hover:underline"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
