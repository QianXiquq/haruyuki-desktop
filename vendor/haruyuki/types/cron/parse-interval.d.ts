/**
 * Parse human-friendly interval strings into 5-field cron expressions.
 *
 * Supported formats:
 *   --every 5m        → "∗/5 ∗ ∗ ∗ ∗"
 *   --every 2h        → "0 ∗/2 ∗ ∗ ∗"
 *   --every 1d        → "0 0 ∗ ∗ ∗"
 *   --at "2026-09-24T09:00:00-07:00" → one-shot at an explicit instant
 *   --at "3:00pm"     → one-shot cron + scheduledFor (UTC)
 *   --at "in 45m"     → one-shot cron + scheduledFor (UTC)
 *   --cron "∗/10 ∗ ∗ ∗ ∗"  → passthrough
 */
export interface ParsedInterval {
    cron: string;
    /** Human-readable summary of what was parsed / any rounding applied. */
    note?: string;
}
/**
 * Parse an --every value (e.g. "5m", "2h", "1d") into a 5-field cron expression.
 * Returns null if the string is not a valid interval.
 */
export declare function parseEvery(input: string): ParsedInterval | null;
export interface ParsedAt {
    /** Absolute UTC time to fire. */
    scheduledFor: Date;
    /** A cron expression that would match the scheduledFor time (for display only). */
    cron: string;
    note?: string;
}
/** Parse an RFC 3339 timestamp only when it carries an explicit timezone. */
export declare function parseRfc3339Timestamp(input: string): Date | null;
/**
 * Parse an --at value into an absolute scheduled time. RFC 3339 inputs retain
 * their explicit timezone; bare clock times use the current process timezone.
 */
export declare function parseAt(input: string, now?: Date): ParsedAt | null;
/**
 * Validate a 5-field cron expression using cron-parser as the source of truth
 * for cron semantics, so that validation and execution (cronMatchesTime) can
 * never disagree. Rejects out-of-range values (`99 99 * * *`, `0 0 32 * *`),
 * reversed ranges (`59-0 * * * *`), zero steps (`0-59/0 * * * *`), and any
 * non-numeric syntax — all of which previously parsed as "valid" and then
 * either never fired or fired with surprising semantics.
 */
export declare function isValidCron(expr: string): boolean;
/**
 * Check if a cron expression matches a given date/time (minute-level).
 *
 * Delegates to cron-parser so that matching and validation share one source
 * of truth: an expression is "valid" iff cron-parser accepts it, and it
 * "matches" a minute iff cron-parser accepts that minute's wall-clock fields.
 * This removes the long-standing mismatch where e.g. day-of-week `7`
 * validated as Sunday but never matched `Date.getDay()` (0-6).
 *
 * When `timezone` is provided, the date is first projected into that IANA
 * timezone. Matching the projected wall time preserves classic cron behavior:
 * skipped spring-forward minutes do not fire, while repeated fall-back
 * minutes may fire twice. Invalid timezones fall back to process local time.
 */
export declare function cronMatchesTime(expr: string, date: Date, timezone?: string | null): boolean;
/**
 * Estimate the period (in ms) of a cron expression for jitter calculation.
 * Only handles common patterns; returns 0 for complex expressions.
 */
export declare function estimatePeriodMs(cron: string): number;
//# sourceMappingURL=parse-interval.d.ts.map