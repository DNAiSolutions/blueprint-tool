// Minimal cron expression parser for the Command Center weekly calendar.
//
// Supports the subset used in our seeded crons:
//   field ::= "*" | int | int-int | int,int,...
//   cron  ::= "min hour dom month dow"
//
// DOW: 0=Sun, 1=Mon, ..., 6=Sat.
// If DOM is restricted (not "*"), the job is "monthly-ish" — we expose that
// via isMonthly so the UI can render it in a separate section instead of
// trying to squeeze it into a weekly grid.

export type ParsedCron = {
  minutes: number[];
  hours: number[];
  dom: number[] | null;      // null = any
  months: number[] | null;   // null = any
  dow: number[] | null;      // null = any; otherwise 0..6
  isMonthly: boolean;        // true when DOM is constrained but DOW isn't
};

function expandField(raw: string, min: number, max: number): number[] | null {
  const s = raw.trim();
  if (s === "*") return null;
  const out = new Set<number>();
  for (const part of s.split(",")) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((n) => parseInt(n, 10));
      for (let i = a; i <= b; i++) {
        if (i >= min && i <= max) out.add(i);
      }
    } else {
      const n = parseInt(part, 10);
      if (!Number.isNaN(n) && n >= min && n <= max) out.add(n);
    }
  }
  return [...out].sort((a, b) => a - b);
}

export function parseCron(expr: string): ParsedCron | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [minRaw, hourRaw, domRaw, monthRaw, dowRaw] = parts;
  const minutes = expandField(minRaw, 0, 59) ?? Array.from({ length: 60 }, (_, i) => i);
  const hours = expandField(hourRaw, 0, 23) ?? Array.from({ length: 24 }, (_, i) => i);
  const dom = expandField(domRaw, 1, 31);
  const months = expandField(monthRaw, 1, 12);
  const dow = expandField(dowRaw, 0, 6);
  const isMonthly = dom !== null && dow === null;
  return { minutes, hours, dom, months, dow, isMonthly };
}

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Return day-of-week indices (0=Sun..6=Sat) that this cron fires on.
// If dow is null, it fires every day (unless DOM restricts).
export function cronDays(p: ParsedCron): number[] {
  if (p.isMonthly) return [];
  if (p.dow) return p.dow;
  return [0, 1, 2, 3, 4, 5, 6];
}

// First hour of the day the cron fires (for simple grid placement).
export function cronFirstHour(p: ParsedCron): number {
  return p.hours[0] ?? 0;
}

export function cronFirstMinute(p: ParsedCron): number {
  return p.minutes[0] ?? 0;
}

export function formatTime(hour: number, minute: number): string {
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? "am" : "pm";
  const mm = minute.toString().padStart(2, "0");
  return `${h12}:${mm}${ampm}`;
}
