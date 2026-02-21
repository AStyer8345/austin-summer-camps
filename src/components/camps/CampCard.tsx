'use client';

import { motion } from 'framer-motion';
import {
  MapPin, Clock, DollarSign, Users, Calendar, ExternalLink,
  Heart, Plus, Bell, Star
} from 'lucide-react';
import { Camp, CATEGORY_CONFIG } from '@/types/database';
import { formatPriceRange, formatAgeRange, getRegistrationBadge } from '@/lib/utils';

interface CampCardProps {
  camp: Camp;
  onAddToCalendar?: (camp: Camp) => void;
  onSave?: (camp: Camp) => void;
  onAlertMe?: (camp: Camp) => void;
  index?: number;
}

export default function CampCard({ camp, onAddToCalendar, onSave, onAlertMe, index = 0 }: CampCardProps) {
  const categoryConfig = CATEGORY_CONFIG[camp.category];
  const regBadge = getRegistrationBadge(camp.registration_status, camp.registration_opens_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`camp-card ${categoryConfig.borderColor}`}
    >
      {/* Category & Registration Status Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className={`badge ${categoryConfig.bgColor} ${categoryConfig.color}`}>
          {categoryConfig.label}
        </span>
        <div className="flex items-center gap-2">
          {camp.fills_fast && (
            <span className="badge bg-red-50 text-red-600 flex items-center gap-1">
              <Star className="w-3 h-3" /> Fills Fast
            </span>
          )}
          <span className={`badge badge-${regBadge.variant}`}>
            {regBadge.text}
          </span>
        </div>
      </div>

      {/* Camp Name & Location */}
      <div className="px-4 pb-3">
        <h3 className="font-display font-bold text-lg text-gray-900 leading-tight mb-1">
          {camp.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{camp.city}, TX</span>
          {camp.camp_type === 'overnight' && (
            <span className="ml-2 text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md font-medium">
              Overnight
            </span>
          )}
        </div>
      </div>

      {/* Notes/Description */}
      {camp.notes && (
        <p className="px-4 pb-3 text-sm text-gray-600 line-clamp-2">
          {camp.notes}
        </p>
      )}

      {/* Info Grid */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
        <InfoItem icon={<Users className="w-3.5 h-3.5" />} label={formatAgeRange(camp.ages_min, camp.ages_max)} />
        <InfoItem
          icon={<DollarSign className="w-3.5 h-3.5" />}
          label={formatPriceRange(camp.price_min, camp.price_max)}
        />
        <InfoItem
          icon={<Clock className="w-3.5 h-3.5" />}
          label={camp.schedule_type === 'full_day' ? 'Full Day' : camp.schedule_type === 'half_day_am' ? 'Half Day (AM)' : camp.schedule_type === 'half_day_pm' ? 'Half Day (PM)' : 'Flexible'}
        />
        <InfoItem
          icon={<Calendar className="w-3.5 h-3.5" />}
          label={camp.duration || 'Varies'}
        />
      </div>

      {/* Tags */}
      {camp.tags && camp.tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {camp.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md"
            >
              {tag}
            </span>
          ))}
          {camp.tags.length > 4 && (
            <span className="text-xs px-2 py-0.5 text-gray-400">
              +{camp.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          onClick={() => onAddToCalendar?.(camp)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add to Calendar
        </button>
        <button
          onClick={() => onSave?.(camp)}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-coral-500 hover:border-coral-200 transition-colors"
          aria-label="Save camp"
        >
          <Heart className="w-4 h-4" />
        </button>
        {camp.registration_status === 'opens_soon' && (
          <button
            onClick={() => onAlertMe?.(camp)}
            className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-sunshine-600 hover:border-sunshine-200 transition-colors"
            aria-label="Alert when registration opens"
          >
            <Bell className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Register Link */}
      {camp.website && (
        <div className="border-t border-gray-100 px-4 py-2.5">
          <a
            href={camp.registration_url || camp.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-sky-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit Website / Register
          </a>
        </div>
      )}
    </motion.div>
  );
}

function InfoItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-600">
      <span className="text-gray-400">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
