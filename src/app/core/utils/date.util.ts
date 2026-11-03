/**
 * The gym's "today" - always evaluated in India time (Asia/Kolkata), never UTC.
 * `new Date().toISOString().slice(0, 10)` is the UTC date and is wrong between
 * midnight and 05:30 IST, which made check-in status flip a day early/late.
 */
export const GYM_TIMEZONE = 'Asia/Kolkata';

/** YYYY-MM-DD for the given instant, as seen on a wall clock in India. */
export function gymDateString(at: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: GYM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}
