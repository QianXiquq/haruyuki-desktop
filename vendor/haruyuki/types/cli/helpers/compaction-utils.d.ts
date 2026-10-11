/**
 * Check if a user message is a compaction summary (system_alert with summary content).
 * Returns the summary text if found, null otherwise.
 *
 * Kept in a standalone file so both accumulator.ts and backfill.ts can import
 * it without creating a circular dependency between them.
 */
export declare function extractCompactionSummary(text: string): string | null;
//# sourceMappingURL=compaction-utils.d.ts.map