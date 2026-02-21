'use client';

import { useState, useMemo } from 'react';
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
import { Camp, CATEGORY_CONFIG } from '@/types/database';
import { getSummerWeeks } from '@/lib/utils';
import { format } from 'date-fns';
import { Search, DollarSign, Trash2, Download } from 'lucide-react';
import WeekRow from './WeekRow';
import DraggableCampCard from './DraggableCampCard';
import CampDragOverlay from './CampDragOverlay';

interface CalendarEntry {
  weekIndex: number;
  camp: Camp;
}

interface SummerCalendarProps {
  camps: Camp[];
}

export default function SummerCalendar({ camps }: SummerCalendarProps) {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [activeDragCamp, setActiveDragCamp] = useState<Camp | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        c.tags?.some(t => t.toLowerCase().includes(s))
      );
    }
    if (selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }
    return result;
  }, [camps, searchTerm, selectedCategory]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    return entries.reduce((sum, entry) => {
      const price = entry.camp.price_min || entry.camp.price_max || 0;
      return sum + price;
    }, 0);
  }, [entries]);

  // Get entries for a specific week
  const getWeekEntries = (weekIndex: number) => {
    return entries.filter(e => e.weekIndex === weekIndex);
  };

  // Check if a week has a conflict (same camp scheduled twice)
  const hasConflict = (weekIndex: number, campId: string) => {
    return entries.some(e => e.weekIndex === weekIndex && e.camp.id === campId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const campId = String(event.active.id);
    const camp = camps.find(c => c.id === campId);
    if (camp) setActiveDragCamp(camp);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragCamp(null);

    const { active, over } = event;
    if (!over) return;

    const campId = String(active.id);
    const weekIndex = parseInt(String(over.id).replace('week-', ''));
    if (isNaN(weekIndex)) return;

    const camp = camps.find(c => c.id === campId);
    if (!camp) return;

    // Don't add duplicate
    if (hasConflict(weekIndex, campId)) return;

    setEntries(prev => [...prev, { weekIndex, camp }]);
  };

  const removeEntry = (weekIndex: number, campId: string) => {
    setEntries(prev => prev.filter(e => !(e.weekIndex === weekIndex && e.camp.id === campId)));
  };

  const clearAll = () => {
    setEntries([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Summer Calendar Planner</h2>
        <p className="text-sm text-gray-500 mt-1">
          Drag camps onto weeks to build your summer schedule. Track costs and avoid conflicts.
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
          <div className="flex-1">
            {/* Summary Bar */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-400">|</div>
                <div className="text-sm text-gray-500">
                  {entries.length} camp{entries.length !== 1 ? 's' : ''} scheduled across {new Set(entries.map(e => e.weekIndex)).size} week{new Set(entries.map(e => e.weekIndex)).size !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  disabled={entries.length === 0}
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
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

            {/* Week Rows */}
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

          {/* Camp Sidebar */}
          <div className="w-72 flex-shrink-0 sticky top-20 hidden lg:block">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-[calc(100vh-120px)] flex flex-col">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Drag Camps to Calendar</h3>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search camps..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:border-sky-300 focus:ring-1 focus:ring-sky-100 outline-none"
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
              <div className="overflow-y-auto p-2 space-y-1 flex-1">
                {filteredCamps.map((camp) => (
                  <DraggableCampCard key={camp.id} camp={camp} />
                ))}
                {filteredCamps.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No camps match your search</p>
                )}
              </div>
              <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[10px] text-gray-400 text-center">
                  {filteredCamps.length} camps available
                </p>
              </div>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeDragCamp && <CampDragOverlay camp={activeDragCamp} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
