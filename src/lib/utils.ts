import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, eachWeekOfInterval, startOfWeek, addDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'Contact for pricing';
  if (price === 0) return 'FREE';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Contact for pricing';
  if (min === 0 && (max === null || max === 0)) return 'FREE';
  if (min !== null && max !== null && min !== max) {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  }
  return formatPrice(min ?? max);
}

export function formatAgeRange(min: number, max: number): string {
  if (min === max) return `Age ${min}`;
  return `Ages ${min}-${max}`;
}

export function formatDateRange(start: string, end: string): string {
  const s = parseISO(start);
  const e = parseISO(end);
  if (format(s, 'MMM') === format(e, 'MMM')) {
    return `${format(s, 'MMM d')}-${format(e, 'd')}`;
  }
  return `${format(s, 'MMM d')} - ${format(e, 'MMM d')}`;
}

export function getSummerWeeks(year: number = 2026): { start: Date; end: Date; label: string }[] {
  const summerStart = new Date(year, 5, 2); // June 2
  const summerEnd = new Date(year, 7, 15); // Aug 15

  const weeks = eachWeekOfInterval(
    { start: summerStart, end: summerEnd },
    { weekStartsOn: 1 } // Monday
  );

  return weeks.map((weekStart) => {
    const start = startOfWeek(weekStart, { weekStartsOn: 1 });
    const end = addDays(start, 4); // Friday
    return {
      start,
      end,
      label: `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`,
    };
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getRegistrationBadge(status: string, opensDate: string | null): {
  text: string;
  variant: 'success' | 'warning' | 'info' | 'danger';
} {
  switch (status) {
    case 'open':
      return { text: 'Now Open', variant: 'success' };
    case 'opens_soon':
      return {
        text: opensDate ? `Opens ${format(parseISO(opensDate), 'MMM d')}` : 'Opens Soon',
        variant: 'info',
      };
    case 'waitlist':
      return { text: 'Waitlist', variant: 'warning' };
    case 'closed':
      return { text: 'Closed', variant: 'danger' };
    default:
      return { text: 'Check Website', variant: 'info' };
  }
}
