/**
 * "Where your week goes" — pure, client-side insight computation over the
 * user's real calendar events. No network, no side effects: given a set of
 * events and a 7-day window, it returns time-by-calendar, per-day load, the
 * busiest day, and headline totals.
 */
import { addDays, startOfWeek, startOfDay, isSameDay, format } from 'date-fns';
import type { CalendarEvent, Calendar } from '@shared/types';

export interface CalendarSlice {
  name: string;
  color: string;
  hours: number;
  count: number;
  /** Share of total scheduled hours, 0..1. */
  pct: number;
}

export interface DayLoad {
  label: string; // e.g. "Mon"
  date: Date;
  hours: number;
  count: number;
  isToday: boolean;
}

export interface WeekInsights {
  windowStart: Date;
  windowEnd: Date;
  totalHours: number;
  eventCount: number;
  /** Days in the window that have at least one timed event. */
  activeDays: number;
  avgHoursPerActiveDay: number;
  busiestDay: DayLoad | null;
  byCalendar: CalendarSlice[];
  perDay: DayLoad[]; // always 7 entries, window start .. +6
  longestEvent: { title: string; hours: number } | null;
}

export type InsightRange = 'thisWeek' | 'next7';

const HOUR_MS = 60 * 60 * 1000;

/** Duration of a timed event in hours (all-day events contribute 0). */
function eventHours(ev: CalendarEvent): number {
  if (ev.allDay) return 0;
  const start = new Date(ev.occurrenceInstanceStart ?? ev.start).getTime();
  const end = new Date(ev.occurrenceInstanceEnd ?? ev.end).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    return 0;
  return (end - start) / HOUR_MS;
}

function eventStart(ev: CalendarEvent): Date {
  return new Date(ev.occurrenceInstanceStart ?? ev.start);
}

/** Resolve the 7-day window for a given range preset. */
export function getInsightWindow(
  range: InsightRange,
  now: Date = new Date()
): { start: Date; end: Date } {
  if (range === 'next7') {
    const start = startOfDay(now);
    return { start, end: addDays(start, 7) };
  }
  // thisWeek: Sunday-based week containing today
  const start = startOfWeek(now, { weekStartsOn: 0 });
  return { start, end: addDays(start, 7) };
}

export function computeWeekInsights(
  events: CalendarEvent[],
  calendars: Calendar[],
  windowStart: Date,
  now: Date = new Date()
): WeekInsights {
  const windowEnd = addDays(windowStart, 7);
  const inWindow = events.filter((ev) => {
    const s = eventStart(ev);
    return s >= windowStart && s < windowEnd;
  });

  const colorOf = (name?: string) =>
    calendars.find((c) => c.name === name)?.color || 'var(--primary)';

  // Per-day buckets (7 days).
  const perDay: DayLoad[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(windowStart, i);
    return {
      label: format(date, 'EEE'),
      date,
      hours: 0,
      count: 0,
      isToday: isSameDay(date, now),
    };
  });

  // Per-calendar buckets.
  const calMap = new Map<string, CalendarSlice>();

  let totalHours = 0;
  let eventCount = 0;
  let longest: { title: string; hours: number } | null = null;

  for (const ev of inWindow) {
    const hours = eventHours(ev);
    eventCount += 1;

    const dayIdx = Math.floor(
      (startOfDay(eventStart(ev)).getTime() - windowStart.getTime()) /
        (24 * HOUR_MS)
    );
    if (dayIdx >= 0 && dayIdx < 7) {
      perDay[dayIdx].count += 1;
      perDay[dayIdx].hours += hours;
    }

    if (hours > 0) {
      totalHours += hours;
      const name = ev.calendarName || 'Uncategorized';
      const slice = calMap.get(name) ?? {
        name,
        color: colorOf(ev.calendarName),
        hours: 0,
        count: 0,
        pct: 0,
      };
      slice.hours += hours;
      slice.count += 1;
      calMap.set(name, slice);

      if (!longest || hours > longest.hours) {
        longest = { title: ev.title, hours };
      }
    }
  }

  const byCalendar = [...calMap.values()]
    .map((s) => ({ ...s, pct: totalHours > 0 ? s.hours / totalHours : 0 }))
    .sort((a, b) => b.hours - a.hours);

  const busiestDay =
    perDay.reduce<DayLoad | null>(
      (best, d) => (d.hours > (best?.hours ?? 0) ? d : best),
      null
    ) ?? null;

  const activeDays = perDay.filter((d) => d.hours > 0).length;

  return {
    windowStart,
    windowEnd,
    totalHours,
    eventCount,
    activeDays,
    avgHoursPerActiveDay: activeDays > 0 ? totalHours / activeDays : 0,
    busiestDay: busiestDay && busiestDay.hours > 0 ? busiestDay : null,
    byCalendar,
    perDay,
    longestEvent: longest,
  };
}

/** Format an hours number as a compact, human string: 1.5 -> "1h 30m". */
export function formatHours(hours: number): string {
  if (hours <= 0) return '0h';
  const whole = Math.floor(hours);
  const mins = Math.round((hours - whole) * 60);
  if (whole === 0) return `${mins}m`;
  if (mins === 0) return `${whole}h`;
  return `${whole}h ${mins}m`;
}
