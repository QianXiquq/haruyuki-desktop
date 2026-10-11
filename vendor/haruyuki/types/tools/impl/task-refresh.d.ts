/**
 * `/task refresh` — drop the cached subagent configs, re-read them from disk,
 * and report what was found. Discovery problems are surfaced here because this
 * is the only user-invocable place that re-reads subagent files; `errors` mean a
 * subagent was skipped, `warnings` mean it loaded but a declared field no longer
 * has any effect (for example `model:`).
 */
export declare function refreshSubagentConfigs(): Promise<string>;
//# sourceMappingURL=task-refresh.d.ts.map