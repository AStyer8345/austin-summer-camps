const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'supabase', 'seed', 'raw-camp-data.json'), 'utf8')
);

const camps = rawData['2026 Camps'];

// Category mapping from spreadsheet to app enum
const CATEGORY_MAP = {
  'General / Day Camp': 'multi_activity',
  'STEM / Tech': 'academic_stem',
  'Arts / Music': 'arts_music',
  'Theatre / Dance / Performing Arts': 'performing_arts',
  'Sports / Fitness': 'sports',
  'Outdoor / Nature': 'nature_outdoor',
  'Faith-Based': 'faith_vbs',
  'Overnight': 'overnight',
  'Academic / Writing': 'academic_writing',
  'Special Needs / Inclusive': 'special_needs',
};

// Region mapping from city/area
function getRegion(cityArea) {
  const lower = (cityArea || '').toLowerCase();
  if (lower.includes('marble falls') || lower.includes('hill country') || lower.includes('la grange') ||
      lower.includes('rocksprings') || lower.includes('bastrop') || lower.includes('lockhart') ||
      lower.includes('dripping springs') || lower.includes('bee cave') || lower.includes('bandera') ||
      lower.includes('kerrville') || lower.includes('blanco') || lower.includes('barksdale')) {
    return 'hill_country';
  }
  if (lower.includes('round rock') || lower.includes('georgetown') || lower.includes('cedar park') ||
      lower.includes('pflugerville') || lower.includes('leander') || lower.includes('hutto')) {
    return 'north_suburbs';
  }
  if (lower.includes('buda') || lower.includes('kyle') || lower.includes('san marcos') ||
      lower.includes('wimberley') || lower.includes('sunset valley')) {
    return 'south_suburbs';
  }
  if (lower.includes('lakeway') || lower.includes('west lake') || lower.includes('westlake')) {
    return 'austin_metro';
  }
  return 'austin_metro';
}

// Parse age range from free-text
function parseAges(agesStr) {
  if (!agesStr) return { min: 5, max: 12 };
  const str = agesStr.toString();

  // "Rising K-3rd" / "Rising K-8th"
  const risingMatch = str.match(/Rising\s+K-(\d+)/i);
  if (risingMatch) return { min: 5, max: parseInt(risingMatch[1]) + 5 };

  // "Rising 10th-12th grade"
  const risingHighMatch = str.match(/Rising\s+(\d+)(?:th|st|nd|rd)-(\d+)(?:th|st|nd|rd)/i);
  if (risingHighMatch) return { min: parseInt(risingHighMatch[1]) + 4, max: parseInt(risingHighMatch[2]) + 4 };

  // "Grades 1-10" or "Grades 3-12"
  const gradeMatch = str.match(/Grades?\s+(\d+)-(\d+)/i);
  if (gradeMatch) return { min: parseInt(gradeMatch[1]) + 5, max: parseInt(gradeMatch[2]) + 5 };

  // "Grades 3-8"
  const gradeMatch2 = str.match(/Grade\s+(\d+)-(\d+)/i);
  if (gradeMatch2) return { min: parseInt(gradeMatch2[1]) + 5, max: parseInt(gradeMatch2[2]) + 5 };

  // "Girls entering 4th-8th grade"
  const enteringMatch = str.match(/entering\s+(\d+)(?:th|st|nd|rd)-(\d+)(?:th|st|nd|rd)/i);
  if (enteringMatch) return { min: parseInt(enteringMatch[1]) + 5, max: parseInt(enteringMatch[2]) + 5 };

  // "3-Grade 9"
  const mixedMatch = str.match(/(\d+)-Grade\s+(\d+)/i);
  if (mixedMatch) return { min: parseInt(mixedMatch[1]), max: parseInt(mixedMatch[2]) + 5 };

  // "K-13"
  const kMatch = str.match(/K-(\d+)/i);
  if (kMatch) return { min: 5, max: parseInt(kMatch[1]) };

  // "High school"
  if (str.toLowerCase().includes('high school')) return { min: 14, max: 18 };

  // "~7-17" or "4-13" standard range
  const rangeMatch = str.match(/~?(\d+)-(\d+)/);
  if (rangeMatch) return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };

  // "5-12 (teens 12-15 select sites)"
  const parenMatch = str.match(/(\d+)-(\d+)\s*\(/);
  if (parenMatch) return { min: parseInt(parenMatch[1]), max: parseInt(parenMatch[2]) };

  // "Children of fallen military" - special case
  if (str.toLowerCase().includes('children')) return { min: 6, max: 17 };

  // Fallback: "Varies"
  return { min: 5, max: 17 };
}

// Parse price range from free-text
function parsePrices(priceStr) {
  if (!priceStr) return { min: null, max: null, note: 'Contact for pricing' };
  const str = priceStr.toString();

  if (str.toUpperCase() === 'FREE') return { min: 0, max: 0, note: 'FREE' };
  if (str.toLowerCase().includes('varies') || str.toLowerCase() === 'city rates') {
    return { min: null, max: null, note: str };
  }

  // "$135-500 (sliding scale)"
  const rangeParenMatch = str.match(/\$(\d[\d,]*)-(\d[\d,]*)\s*\(([^)]+)\)/);
  if (rangeParenMatch) {
    return {
      min: parseInt(rangeParenMatch[1].replace(/,/g, '')),
      max: parseInt(rangeParenMatch[2].replace(/,/g, '')),
      note: rangeParenMatch[3],
    };
  }

  // "$400/wk or $85/day"
  const orMatch = str.match(/\$(\d[\d,]*)\/?(\w*)\s+or\s+\$(\d[\d,]*)/);
  if (orMatch) {
    return {
      min: Math.min(parseInt(orMatch[1].replace(/,/g, '')), parseInt(orMatch[3].replace(/,/g, ''))),
      max: Math.max(parseInt(orMatch[1].replace(/,/g, '')), parseInt(orMatch[3].replace(/,/g, ''))),
      note: str,
    };
  }

  // "Member $385 / Standard $425"
  const memberMatch = str.match(/Member\s+\$(\d[\d,]*).*Standard\s+\$(\d[\d,]*)/i);
  if (memberMatch) {
    return {
      min: parseInt(memberMatch[1].replace(/,/g, '')),
      max: parseInt(memberMatch[2].replace(/,/g, '')),
      note: 'Member/Standard pricing',
    };
  }

  // "$250 ($195 early bird thru 4/15)" or "$250 ($195 early bird)"
  const earlyBirdMatch = str.match(/\$(\d[\d,]*)\s*\(\$(\d[\d,]*)\s+early\s+bird/i);
  if (earlyBirdMatch) {
    return {
      min: parseInt(earlyBirdMatch[2].replace(/,/g, '')),
      max: parseInt(earlyBirdMatch[1].replace(/,/g, '')),
      note: 'Early bird pricing available',
    };
  }

  // "$355 half-day / $445 full-day / $545 extended day"
  const multiSlashMatch = str.match(/\$(\d[\d,]*).*\$(\d[\d,]*).*\$(\d[\d,]*)/);
  if (multiSlashMatch) {
    const vals = [
      parseInt(multiSlashMatch[1].replace(/,/g, '')),
      parseInt(multiSlashMatch[2].replace(/,/g, '')),
      parseInt(multiSlashMatch[3].replace(/,/g, '')),
    ];
    return { min: Math.min(...vals), max: Math.max(...vals), note: str };
  }

  // "$270 half-day / $420 full-day"
  const halfFullMatch = str.match(/\$(\d[\d,]*).*half.*\$(\d[\d,]*).*full/i);
  if (halfFullMatch) {
    return {
      min: parseInt(halfFullMatch[1].replace(/,/g, '')),
      max: parseInt(halfFullMatch[2].replace(/,/g, '')),
      note: 'Half-day / Full-day options',
    };
  }

  // "$272-365/wk"
  const rangeWkMatch = str.match(/\$(\d[\d,]*)-(\d[\d,]*)(?:\/wk)?/);
  if (rangeWkMatch) {
    return {
      min: parseInt(rangeWkMatch[1].replace(/,/g, '')),
      max: parseInt(rangeWkMatch[2].replace(/,/g, '')),
      note: 'per week',
    };
  }

  // "~$599/wk (discounts available)"
  const tildeMatch = str.match(/~?\$(\d[\d,]*)(?:\/wk)?/);
  if (tildeMatch) {
    const val = parseInt(tildeMatch[1].replace(/,/g, ''));
    return { min: val, max: val, note: str.includes('discount') ? 'Discounts available' : 'per week' };
  }

  // "$60/day"
  const dayMatch = str.match(/\$(\d[\d,]*)\/day/);
  if (dayMatch) {
    const val = parseInt(dayMatch[1].replace(/,/g, ''));
    return { min: val * 5, max: val * 5, note: `$${val}/day` };
  }

  // "$550/wk" single price
  const singleMatch = str.match(/\$(\d[\d,]*)(?:\/wk)?/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1].replace(/,/g, ''));
    return { min: val, max: val, note: 'per week' };
  }

  // "$2,400-4,595/session"
  const sessionMatch = str.match(/\$([\d,]+)-([\d,]+)\/session/);
  if (sessionMatch) {
    return {
      min: parseInt(sessionMatch[1].replace(/,/g, '')),
      max: parseInt(sessionMatch[2].replace(/,/g, '')),
      note: 'per session',
    };
  }

  return { min: null, max: null, note: str };
}

// Parse registration status
function getRegistrationStatus(status) {
  if (!status) return 'unknown';
  const s = status.toLowerCase();
  if (s === 'open' || s.includes('walk-in')) return 'open';
  if (s.includes('opens') || s.includes('closing')) return 'opens_soon';
  if (s.includes('waitlist')) return 'waitlist';
  if (s.includes('closed')) return 'closed';
  return 'unknown';
}

// Parse registration opens date
function getRegistrationOpensDate(status) {
  if (!status) return null;
  // "Opens 2/28" "Opens 2/25" "Opens 4/1" "Opens Feb 2026" "Opens Today (2/21)"
  const dateMatch = status.match(/Opens?\s+(\d+)\/(\d+)/);
  if (dateMatch) {
    const month = dateMatch[1].padStart(2, '0');
    const day = dateMatch[2].padStart(2, '0');
    return `2026-${month}-${day}`;
  }
  const todayMatch = status.match(/Today\s*\((\d+)\/(\d+)\)/);
  if (todayMatch) {
    return `2026-${todayMatch[1].padStart(2, '0')}-${todayMatch[2].padStart(2, '0')}`;
  }
  const febMatch = status.match(/Feb\s+2026/);
  if (febMatch) return '2026-02-15';
  return null;
}

// Determine camp_type
function getCampType(category, notes) {
  if (category === 'overnight' || category === 'Overnight') return 'overnight';
  const n = (notes || '').toLowerCase();
  if (n.includes('overnight option') || n.includes('& overnight')) return 'both';
  return 'day';
}

// Generate tags from notes and category
function generateTags(camp) {
  const tags = [];
  const notes = (camp['Discounts / Notes'] || '').toLowerCase();
  const name = (camp['Camp Name'] || '').toLowerCase();
  const cat = (camp['Category'] || '').toLowerCase();

  if (notes.includes('scholarship')) tags.push('scholarships');
  if (notes.includes('sibling discount')) tags.push('sibling discount');
  if (notes.includes('early bird')) tags.push('early bird');
  if (notes.includes('aftercare')) tags.push('aftercare');
  if (notes.includes('swim') || notes.includes('pool')) tags.push('swimming');
  if (notes.includes('field trip')) tags.push('field trips');
  if (notes.includes('free') || notes.includes('FREE')) tags.push('free');
  if (notes.includes('bilingual')) tags.push('bilingual');
  if (notes.includes('transportation') || notes.includes('bus')) tags.push('transportation');

  if (cat.includes('stem') || cat.includes('tech')) {
    tags.push('STEM');
    if (notes.includes('coding') || notes.includes('minecraft') || notes.includes('ai') || notes.includes('game design'))
      tags.push('coding');
    if (notes.includes('robot')) tags.push('robotics');
  }
  if (cat.includes('arts') || cat.includes('music')) {
    tags.push('arts');
    if (notes.includes('painting') || notes.includes('ceramic')) tags.push('visual arts');
    if (notes.includes('music')) tags.push('music');
  }
  if (cat.includes('theatre') || cat.includes('performing') || cat.includes('dance')) {
    if (notes.includes('dance') || name.includes('dance') || name.includes('dancer')) tags.push('dance');
    if (notes.includes('theatre') || notes.includes('theater') || notes.includes('musical') || notes.includes('broadway'))
      tags.push('theater');
  }
  if (cat.includes('sport') || cat.includes('fitness')) {
    tags.push('sports');
    if (notes.includes('gymnastics') || name.includes('gymnastics')) tags.push('gymnastics');
    if (notes.includes('rowing') || name.includes('rowing')) tags.push('rowing');
    if (notes.includes('soccer') || name.includes('soccer')) tags.push('soccer');
    if (notes.includes('horseback') || notes.includes('horse')) tags.push('horseback riding');
  }
  if (cat.includes('outdoor') || cat.includes('nature')) {
    tags.push('nature', 'outdoor');
    if (notes.includes('wilderness')) tags.push('wilderness');
  }
  if (cat.includes('faith')) {
    tags.push('faith-based');
    if (notes.includes('bible') || notes.includes('christ')) tags.push('church');
  }
  if (cat.includes('overnight')) tags.push('overnight', 'sleepaway');
  if (cat.includes('writing') || cat.includes('academic')) {
    tags.push('academic');
    if (notes.includes('writing') || notes.includes('poetry') || notes.includes('fiction')) tags.push('writing');
  }
  if (cat.includes('special') || cat.includes('inclusive')) tags.push('inclusive', 'special needs');

  return [...new Set(tags)];
}

// Generate slug from name
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Ensure website has protocol
function formatWebsite(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `https://${url}`;
}

// Skip duplicate entries (marked with "see General", "see Faith", etc.)
function isDuplicate(campName) {
  return campName.includes('(see ') || campName.includes('- see ');
}

// Convert all camps
const convertedCamps = [];
let id = 1;

for (const camp of camps) {
  // Skip duplicates
  if (isDuplicate(camp['Camp Name'])) continue;

  const category = CATEGORY_MAP[camp['Category']] || 'multi_activity';
  const ages = parseAges(camp['Ages']);
  const prices = parsePrices(camp['Price ($/wk or noted)']);
  const region = getRegion(camp['City/Area']);
  const regStatus = getRegistrationStatus(camp['Registration Status']);
  const regOpens = getRegistrationOpensDate(camp['Registration Status']);
  const campType = getCampType(category, camp['Discounts / Notes']);
  const tags = generateTags(camp);

  // Clean camp name (remove "- see General" etc.)
  let name = camp['Camp Name']
    .replace(/\s*\(see\s+\w+\)\s*/gi, '')
    .replace(/\s*-\s*see\s+\w+\s*/gi, '')
    .trim();

  convertedCamps.push({
    id: String(id++),
    name,
    slug: slugify(name),
    category,
    description: null,
    ages_min: ages.min,
    ages_max: ages.max,
    duration: '1 week',
    days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    location_name: camp['Location / Address'] || null,
    address: camp['Location / Address'] || null,
    city: (camp['City/Area'] || 'Austin').split('/')[0].split('(')[0].replace(/\s*Metro\s*/, '').trim(),
    state: 'TX',
    zip: null,
    latitude: null,
    longitude: null,
    price_min: prices.min,
    price_max: prices.max,
    price_note: prices.note,
    camp_type: campType,
    schedule_type: 'full_day',
    region,
    website: formatWebsite(camp['Website']),
    phone: null,
    email: null,
    registration_url: null,
    registration_status: regStatus,
    registration_opens_date: regOpens,
    fills_fast: false,
    notes: camp['Discounts / Notes'] || null,
    tags,
    logo_url: null,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

console.log(`Converted ${convertedCamps.length} camps (skipped ${camps.length - convertedCamps.length} duplicates)`);

// Generate TypeScript sample-data.ts
let tsOutput = `import type { Camp } from '@/types/database';

/**
 * Real camp data from Austin Summer Camps 2026 spreadsheet.
 * ${convertedCamps.length} camps across ${[...new Set(convertedCamps.map(c => c.category))].length} categories.
 */
export const SAMPLE_CAMP_DATA: Camp[] = [\n`;

for (const camp of convertedCamps) {
  tsOutput += `  {\n`;
  tsOutput += `    id: '${camp.id}', name: ${JSON.stringify(camp.name)}, slug: '${camp.slug}',\n`;
  tsOutput += `    category: '${camp.category}', description: null, ages_min: ${camp.ages_min}, ages_max: ${camp.ages_max},\n`;
  tsOutput += `    duration: '1 week', days_of_week: ['Mon','Tue','Wed','Thu','Fri'],\n`;
  tsOutput += `    location_name: ${JSON.stringify(camp.location_name)}, address: ${JSON.stringify(camp.address)},\n`;
  tsOutput += `    city: ${JSON.stringify(camp.city)}, state: 'TX', zip: null, latitude: null, longitude: null,\n`;
  tsOutput += `    price_min: ${camp.price_min}, price_max: ${camp.price_max}, price_note: ${JSON.stringify(camp.price_note)},\n`;
  tsOutput += `    camp_type: '${camp.camp_type}', schedule_type: '${camp.schedule_type}', region: '${camp.region}',\n`;
  tsOutput += `    website: ${JSON.stringify(camp.website)}, phone: null, email: null,\n`;
  tsOutput += `    registration_url: null, registration_status: '${camp.registration_status}', registration_opens_date: ${JSON.stringify(camp.registration_opens_date)},\n`;
  tsOutput += `    fills_fast: false, notes: ${JSON.stringify(camp.notes)},\n`;
  tsOutput += `    tags: ${JSON.stringify(camp.tags)},\n`;
  tsOutput += `    logo_url: null, image_url: null, is_active: true,\n`;
  tsOutput += `    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),\n`;
  tsOutput += `  },\n`;
}

tsOutput += `];\n`;

// Write files
const sampleDataPath = path.join(__dirname, '..', 'src', 'lib', 'sample-data.ts');
fs.writeFileSync(sampleDataPath, tsOutput);
console.log(`Written: ${sampleDataPath}`);

// Also generate SQL seed
let sqlOutput = `-- Austin Summer Camps 2026 - Seed Data
-- Generated from spreadsheet data
-- ${convertedCamps.length} camps

`;

for (const camp of convertedCamps) {
  const escapeSql = (str) => str ? str.replace(/'/g, "''") : null;
  const sqlVal = (val) => val === null ? 'NULL' : `'${escapeSql(String(val))}'`;
  const sqlArr = (arr) => arr && arr.length > 0 ? `ARRAY[${arr.map(t => `'${escapeSql(t)}'`).join(',')}]` : 'NULL';

  sqlOutput += `INSERT INTO camps (name, slug, category, ages_min, ages_max, duration, days_of_week, location_name, address, city, state, price_min, price_max, price_note, camp_type, schedule_type, region, website, registration_status, registration_opens_date, fills_fast, notes, tags, is_active)
VALUES (${sqlVal(camp.name)}, ${sqlVal(camp.slug)}, '${camp.category}', ${camp.ages_min}, ${camp.ages_max}, '1 week', ARRAY['Mon','Tue','Wed','Thu','Fri'], ${sqlVal(camp.location_name)}, ${sqlVal(camp.address)}, ${sqlVal(camp.city)}, 'TX', ${camp.price_min ?? 'NULL'}, ${camp.price_max ?? 'NULL'}, ${sqlVal(camp.price_note)}, '${camp.camp_type}', '${camp.schedule_type}', '${camp.region}', ${sqlVal(camp.website)}, '${camp.registration_status}', ${camp.registration_opens_date ? sqlVal(camp.registration_opens_date) : 'NULL'}, ${camp.fills_fast}, ${sqlVal(camp.notes)}, ${sqlArr(camp.tags)}, true);\n\n`;
}

const seedPath = path.join(__dirname, '..', 'supabase', 'seed', 'seed.sql');
fs.writeFileSync(seedPath, sqlOutput);
console.log(`Written: ${seedPath}`);

// Print category summary
const categoryCounts = {};
for (const camp of convertedCamps) {
  categoryCounts[camp.category] = (categoryCounts[camp.category] || 0) + 1;
}
console.log('\nCategory breakdown:');
for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}

// Print region summary
const regionCounts = {};
for (const camp of convertedCamps) {
  regionCounts[camp.region] = (regionCounts[camp.region] || 0) + 1;
}
console.log('\nRegion breakdown:');
for (const [region, count] of Object.entries(regionCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${region}: ${count}`);
}
