export type CampCategory =
  | 'academic_stem'
  | 'arts_music'
  | 'performing_arts'
  | 'sports'
  | 'nature_outdoor'
  | 'faith_vbs'
  | 'overnight'
  | 'academic_writing'
  | 'special_needs'
  | 'specialty'
  | 'multi_activity';

export type CampRegion =
  | 'austin_metro'
  | 'austin_church_vbs'
  | 'north_suburbs'
  | 'south_suburbs'
  | 'hill_country';

export type CampType = 'day' | 'overnight' | 'both';
export type ScheduleType = 'full_day' | 'half_day_am' | 'half_day_pm' | 'flexible';
export type RegistrationStatus = 'open' | 'opens_soon' | 'closed' | 'waitlist' | 'unknown';
export type AlertStatus = 'pending' | 'sent' | 'clicked';

export interface Camp {
  id: string;
  name: string;
  slug: string;
  category: CampCategory;
  description: string | null;
  ages_min: number;
  ages_max: number;
  duration: string | null;
  days_of_week: string[] | null;
  location_name: string | null;
  address: string | null;
  city: string;
  state: string;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  price_min: number | null;
  price_max: number | null;
  price_note: string | null;
  camp_type: CampType;
  schedule_type: ScheduleType;
  region: CampRegion;
  website: string | null;
  phone: string | null;
  email: string | null;
  registration_url: string | null;
  registration_status: RegistrationStatus;
  registration_opens_date: string | null;
  fills_fast: boolean;
  notes: string | null;
  tags: string[] | null;
  logo_url: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sessions?: CampSession[];
}

export interface CampSession {
  id: string;
  camp_id: string;
  session_name: string | null;
  start_date: string;
  end_date: string;
  days_of_week: string[] | null;
  start_time: string | null;
  end_time: string | null;
  price: number | null;
  spots_total: number | null;
  spots_remaining: number | null;
  is_sold_out: boolean;
  notes: string | null;
  created_at: string;
}

export interface User {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  stripe_customer_id: string | null;
  notification_preferences: {
    email_alerts: boolean;
    sms_alerts: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string;
  age_computed: number;
  allergies: string | null;
  medical_notes: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  tshirt_size: string | null;
  swim_ability: string | null;
  interests: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedCalendar {
  id: string;
  user_id: string;
  child_id: string | null;
  name: string;
  year: number;
  is_active: boolean;
  share_token: string;
  total_cost: number;
  created_at: string;
  updated_at: string;
  entries?: CalendarEntry[];
}

export interface CalendarEntry {
  id: string;
  calendar_id: string;
  camp_id: string;
  session_id: string | null;
  week_start: string;
  week_end: string;
  position: number;
  notes: string | null;
  created_at: string;
  camp?: Camp;
  session?: CampSession;
}

export interface RegistrationAlert {
  id: string;
  email: string;
  camp_id: string;
  user_id: string | null;
  status: AlertStatus;
  notified_at: string | null;
  created_at: string;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  source: string;
  subscribed_at: string;
  synced_to_beehiiv: boolean;
  synced_at: string | null;
  unsubscribed: boolean;
  metadata: Record<string, unknown>;
}

// Filter types for the UI
export interface CampFilters {
  search?: string;
  categories?: CampCategory[];
  regions?: CampRegion[];
  ageMin?: number;
  ageMax?: number;
  priceMin?: number;
  priceMax?: number;
  campType?: CampType;
  scheduleType?: ScheduleType;
  weekStart?: string;
  weekEnd?: string;
  registrationStatus?: RegistrationStatus[];
}

// AI Plan types
export interface AIPlanRequest {
  childName: string;
  childAge: number;
  interests: string[];
  budgetPerWeek: number;
  regions: CampRegion[];
  weeksNeeded: { start: string; end: string };
  campType?: CampType;
  scheduleType?: ScheduleType;
}

export interface AIPlanSuggestion {
  weekStart: string;
  weekEnd: string;
  camp: Camp;
  session?: CampSession;
  reason: string;
  estimatedCost: number;
}

export interface AIPlanResponse {
  childName: string;
  totalCost: number;
  totalWeeks: number;
  suggestions: AIPlanSuggestion[];
  summary: string;
}

// Category display config
export const CATEGORY_CONFIG: Record<CampCategory, { label: string; color: string; bgColor: string; borderColor: string; mapPin: string }> = {
  academic_stem: { label: 'STEM / Tech', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-400', mapPin: '#3B82F6' },
  arts_music: { label: 'Arts / Music', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-400', mapPin: '#8B5CF6' },
  performing_arts: { label: 'Performing Arts', color: 'text-fuchsia-700', bgColor: 'bg-fuchsia-100', borderColor: 'border-fuchsia-400', mapPin: '#D946EF' },
  sports: { label: 'Sports / Fitness', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-400', mapPin: '#F97316' },
  nature_outdoor: { label: 'Nature / Outdoor', color: 'text-teal-700', bgColor: 'bg-teal-100', borderColor: 'border-teal-400', mapPin: '#14B8A6' },
  faith_vbs: { label: 'Faith-Based', color: 'text-rose-700', bgColor: 'bg-rose-100', borderColor: 'border-rose-400', mapPin: '#F43F5E' },
  overnight: { label: 'Overnight', color: 'text-indigo-700', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-400', mapPin: '#6366F1' },
  academic_writing: { label: 'Academic / Writing', color: 'text-lime-700', bgColor: 'bg-lime-100', borderColor: 'border-lime-400', mapPin: '#84CC16' },
  special_needs: { label: 'Inclusive', color: 'text-sky-700', bgColor: 'bg-sky-100', borderColor: 'border-sky-400', mapPin: '#0EA5E9' },
  specialty: { label: 'Specialty', color: 'text-pink-700', bgColor: 'bg-pink-100', borderColor: 'border-pink-400', mapPin: '#EC4899' },
  multi_activity: { label: 'General / Day Camp', color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-400', mapPin: '#6B7280' },
};

export const REGION_CONFIG: Record<CampRegion, { label: string; description: string }> = {
  austin_metro: { label: 'Austin Metro', description: 'Greater Austin area' },
  austin_church_vbs: { label: 'Austin Church/VBS', description: 'Church and VBS camps in Austin' },
  north_suburbs: { label: 'North Suburbs', description: 'Round Rock, Georgetown, Cedar Park, Pflugerville, Leander, Hutto' },
  south_suburbs: { label: 'South Suburbs', description: 'Buda, Kyle, San Marcos, Wimberley, Dripping Springs' },
  hill_country: { label: 'Hill Country', description: 'Marble Falls, Bandera, Kerrville, Boerne, New Braunfels, Blanco, Bee Cave, Barksdale' },
};
