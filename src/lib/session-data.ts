import type { Camp, CampSession } from '@/types/database';

/**
 * Generate realistic summer 2026 sessions for camps.
 * Each camp gets weekly sessions across June-August.
 */

// Summer 2026 weeks (Monday start dates)
const SUMMER_WEEKS_2026 = [
  { start: '2026-06-01', end: '2026-06-05', label: 'Week 1' },
  { start: '2026-06-08', end: '2026-06-12', label: 'Week 2' },
  { start: '2026-06-15', end: '2026-06-19', label: 'Week 3' },
  { start: '2026-06-22', end: '2026-06-26', label: 'Week 4' },
  { start: '2026-06-29', end: '2026-07-03', label: 'Week 5' },
  { start: '2026-07-06', end: '2026-07-10', label: 'Week 6' },
  { start: '2026-07-13', end: '2026-07-17', label: 'Week 7' },
  { start: '2026-07-20', end: '2026-07-24', label: 'Week 8' },
  { start: '2026-07-27', end: '2026-07-31', label: 'Week 9' },
  { start: '2026-08-03', end: '2026-08-07', label: 'Week 10' },
  { start: '2026-08-10', end: '2026-08-14', label: 'Week 11' },
];

// Themed session names by category
const SESSION_THEMES: Record<string, string[]> = {
  academic_stem: [
    'Robotics & Coding', 'Space Explorers', 'Chemistry Lab', 'Game Design',
    'Engineering Challenge', 'AI & Machine Learning', 'Minecraft Modding',
    'Drone Pilots', 'Science Olympiad Prep', '3D Printing & Design',
    'Python Programming', 'Rocketry Week',
  ],
  arts_music: [
    'Mixed Media Mashup', 'Painting & Drawing', 'Pottery & Ceramics', 'Music Production',
    'Guitar Camp', 'Watercolor Week', 'Digital Art & Design', 'Sculpture Studio',
    'Photography Basics', 'Songwriting Workshop', 'Ukulele Jam',
  ],
  performing_arts: [
    'Musical Theatre Intensive', 'Shakespeare in the Park', 'Improv Comedy',
    'Dance Showcase', 'Stage Combat', 'Audition Workshop', 'Broadway Jr.',
    'Film Acting', 'Hip Hop Dance', 'Ballet Intensive', 'Jazz & Tap',
  ],
  sports: [
    'All-Sports Week', 'Soccer Skills Camp', 'Basketball Fundamentals',
    'Swim & Dive', 'Tennis Academy', 'Gymnastics Camp', 'Cheer & Tumble',
    'Track & Field', 'Flag Football', 'Volleyball Camp', 'Martial Arts',
  ],
  nature_outdoor: [
    'Wilderness Survival', 'Nature Explorers', 'Creek & Trail Adventures',
    'Birding & Wildlife', 'Garden & Farm', 'Archery & Outdoor Skills',
    'Rock Climbing & Hiking', 'Fishing & Water Fun', 'Bug Safari',
    'Forest School', 'Astronomy Night Camp',
  ],
  faith_vbs: [
    'VBS: Adventure Island', 'VBS: Deep Sea Discovery', 'Faith & Fun Week',
    'Bible Heroes Camp', 'VBS: Space Station', 'Creation Exploration',
    'VBS: Mega Sports Camp', 'Worship & Arts Week', 'Mission Possible',
    'VBS: Camp Firelight', 'Kingdom Quest',
  ],
  overnight: [
    'Classic Camp Week', 'Adventure Camp', 'Explorer Session',
    'Pioneer Week', 'Trailblazer Session', 'Campfire & Stars',
    'Mountain Adventure', 'Lake & Trails', 'Wilderness Week',
  ],
  academic_writing: [
    'Creative Writing Workshop', 'Young Authors Camp', 'Poetry & Prose',
    'Storytelling Adventures', 'Journalism Camp', 'Debate & Public Speaking',
    'Essay Bootcamp', 'Screenwriting Basics', 'Book Club Camp',
  ],
  special_needs: [
    'Adaptive Sports Week', 'Sensory-Friendly Camp', 'Social Skills Camp',
    'Arts & Expression', 'Nature Therapy', 'Music & Movement',
    'Inclusive Play', 'Life Skills Camp', 'Buddy Camp',
  ],
  specialty: [
    'Cooking Camp', 'Magic & Illusion', 'LEGO Masters', 'Chess Camp',
    'Fashion Design', 'Comic Book Creator', 'Board Game Design',
    'Spy Academy', 'Minecraft Build', 'Video Production',
  ],
  multi_activity: [
    'Adventure Week', 'Discovery Camp', 'Explorer Week', 'Fun & Games',
    'Summer Blast', 'All-Star Week', 'Camp Classics', 'Mix It Up',
    'Ultimate Camp Week', 'Super Summer', 'Power Play Week',
  ],
};

// Seeded pseudo-random based on camp id for consistency
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateSessionsForCamp(camp: Camp): CampSession[] {
  const sessions: CampSession[] = [];
  const rng = seededRandom(parseInt(camp.id) || camp.name.length * 7);

  // How many weeks does this camp run? Most run 8-11 weeks, some 4-6
  const isSmallCamp = camp.price_min !== null && camp.price_min < 100;
  const isOvernightCamp = camp.camp_type === 'overnight';
  const isFaithCamp = camp.category === 'faith_vbs';

  let numWeeks: number;
  if (isFaithCamp) {
    // VBS typically runs 1-2 weeks
    numWeeks = Math.floor(rng() * 2) + 1;
  } else if (isOvernightCamp) {
    // Overnight camps have 4-8 sessions
    numWeeks = Math.floor(rng() * 5) + 4;
  } else if (isSmallCamp) {
    numWeeks = Math.floor(rng() * 4) + 3;
  } else {
    numWeeks = Math.floor(rng() * 4) + 8;
  }

  // Clamp to available weeks
  numWeeks = Math.min(numWeeks, SUMMER_WEEKS_2026.length);

  // Start week offset (0-2)
  const startOffset = isFaithCamp ? Math.floor(rng() * 4) + 2 : Math.floor(rng() * 2);

  // Get themed names for this category
  const themes = SESSION_THEMES[camp.category] || SESSION_THEMES.multi_activity;

  // Schedule type determines times
  let startTime: string;
  let endTime: string;
  if (camp.schedule_type === 'half_day_am') {
    startTime = '09:00';
    endTime = '12:00';
  } else if (camp.schedule_type === 'half_day_pm') {
    startTime = '13:00';
    endTime = '16:00';
  } else {
    startTime = '09:00';
    endTime = '15:00';
  }

  // Calculate per-session price
  const basePrice = camp.price_min ?? camp.price_max ?? 250;
  const maxPrice = camp.price_max ?? camp.price_min ?? 350;

  for (let i = 0; i < numWeeks; i++) {
    const weekIdx = startOffset + i;
    if (weekIdx >= SUMMER_WEEKS_2026.length) break;

    const week = SUMMER_WEEKS_2026[weekIdx];
    const themeIdx = i % themes.length;
    const sessionName = themes[themeIdx];

    // Vary price slightly between sessions
    const priceDelta = maxPrice - basePrice;
    const sessionPrice = Math.round(basePrice + rng() * priceDelta);

    // Random spots
    const spotsTotal = Math.floor(rng() * 30) + 10;
    const spotsRemaining = Math.max(0, Math.floor(rng() * spotsTotal));
    const isSoldOut = spotsRemaining === 0 && rng() < 0.15;

    sessions.push({
      id: `s-${camp.id}-${i + 1}`,
      camp_id: camp.id,
      session_name: sessionName,
      start_date: week.start,
      end_date: week.end,
      days_of_week: camp.days_of_week || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      start_time: isOvernightCamp ? null : startTime,
      end_time: isOvernightCamp ? null : endTime,
      price: sessionPrice,
      spots_total: spotsTotal,
      spots_remaining: isSoldOut ? 0 : spotsRemaining,
      is_sold_out: isSoldOut,
      notes: null,
      created_at: new Date().toISOString(),
    });
  }

  return sessions;
}

export function attachSessionsToCamps(camps: Camp[]): Camp[] {
  return camps.map(camp => ({
    ...camp,
    sessions: generateSessionsForCamp(camp),
  }));
}
