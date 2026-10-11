/**
 * Shared formatting for workflow execution statistics. Lives in the tools
 * layer so both the tool (completion notification summary) and the CLI
 * (/workflows) print identical numbers.
 */
/** 500 → "500", 5200 → "5.2k", 167200 → "167.2k", 2_400_000 → "2.4M". */
export declare function formatCompactTokens(n: number): string;
/** 9_400 → "9s", 65_000 → "1m 05s", 3_725_000 → "1h 02m". */
export declare function formatWorkflowDuration(ms: number): string;
export interface WorkflowStatsInput {
    durationMs: number;
    agentsDone: number;
    agentsTotal: number;
    totalTokens: number;
}
/**
 * Progress fragment for a live run: "2/3 agents done · 9s · 133.6k tokens".
 * Tokens are omitted while none have been reported.
 */
export declare function formatWorkflowProgress(stats: WorkflowStatsInput): string;
/** Summary fragment for a finished run: "36s · 4 agents · 167.2k tokens". */
export declare function formatWorkflowSummary(stats: WorkflowStatsInput): string;
//# sourceMappingURL=format-stats.d.ts.map