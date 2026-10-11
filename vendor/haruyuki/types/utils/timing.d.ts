/**
 * Check if debug timings are enabled via HARUYUKI_DEBUG_TIMINGS env var
 * Set HARUYUKI_DEBUG_TIMINGS=1 or HARUYUKI_DEBUG_TIMINGS=true to enable timing logs
 */
export declare function isTimingsEnabled(): boolean;
/**
 * Format duration nicely: "245ms" or "1.52s"
 */
export declare function formatDuration(ms: number): string;
/**
 * Format timestamp: "12:34:56.789"
 */
export declare function formatTimestamp(date: Date): string;
/**
 * Log timing message to stderr (won't interfere with stdout JSON in headless mode)
 */
export declare function logTiming(message: string): void;
/**
 * Mark a named milestone in the boot/execution sequence.
 * Call this at key points to track where time is spent.
 *
 * @param name - Descriptive name like "SETTINGS_LOADED" or "AGENT_RESOLVED"
 */
export declare function markMilestone(name: string): void;
/**
 * Measure time elapsed since a previous milestone.
 *
 * @param label - Description of what we're measuring (e.g., "tool loading")
 * @param fromMilestone - Name of the starting milestone
 */
export declare function measureSinceMilestone(label: string, fromMilestone: string): void;
/**
 * Get the duration between two milestones in milliseconds.
 * Returns null if either milestone doesn't exist.
 */
export declare function getMilestoneDuration(fromMilestone: string, toMilestone: string): number | null;
/**
 * Print a summary of all milestones with relative timestamps.
 * Useful at the end of a benchmark run.
 */
export declare function reportAllMilestones(): void;
/**
 * Clear all milestones (useful for running multiple benchmarks in sequence).
 */
export declare function clearMilestones(): void;
type SimpleFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
/**
 * Create an instrumented fetch that logs timing for every request.
 * Logs request start and end (with duration and status) to stderr.
 */
export declare function createTimingFetch(baseFetch: SimpleFetch): SimpleFetch;
export {};
//# sourceMappingURL=timing.d.ts.map