export type BoundaryErrorOptions = {
    context: string;
    errorType: string;
    error: unknown;
    httpStatus?: number;
    modelId?: string;
    runId?: string;
    recentChunks?: Record<string, unknown>[];
};
export declare function formatTelemetryErrorMessage(error: unknown): string;
export declare function trackBoundaryError(options: BoundaryErrorOptions): void;
export declare function trackEndTurnNoAssistant(params: {
    fallbackKind: "reasoning" | "tool_call";
    modelHandle?: string;
    runId?: string;
    isSubagent: boolean;
    subagentType?: string;
}): void;
//# sourceMappingURL=error-reporting.d.ts.map