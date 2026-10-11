export declare const MAX_PROGRESS_DETAILS_LENGTH = 180;
export declare function asRecord(value: unknown): Record<string, unknown> | null;
export declare function firstNonEmptyString(...values: unknown[]): string | undefined;
export declare function truncateChannelProgressText(value: string, maxLength: number, marker?: string): string;
/**
 * Shared sanitization core for channel-facing progress text: strips ANSI
 * escapes and control characters, redacts secret-looking assignments, and
 * neutralizes platform mentions. Platform adapters layer their own escaping
 * (and truncation marker) on top of this instead of maintaining parallel
 * redaction rules.
 */
export declare function sanitizeChannelProgressCore(value: unknown): string;
export declare function sanitizeChannelProgressText(value: unknown, maxLength?: number): string;
export declare function sanitizeChannelProgressIdentifier(value: unknown, fallback: string): string;
type SkillDescriptionLookup = ReadonlyMap<string, string> | Readonly<Record<string, string | undefined>>;
export type ChannelTurnProgressBuilderOptions = {
    skillDescriptionsByName?: SkillDescriptionLookup;
};
export type ToolCallSummary = {
    id?: string;
    name?: string;
    argumentsText?: string;
};
export type ToolReturnSummary = {
    summary: ToolCallSummary;
    status: "completed" | "error";
    errorDetails?: string;
};
export declare function parseToolArguments(value: string | undefined): Record<string, unknown> | null;
export declare function isSkillToolName(name: string | undefined): boolean;
export declare function formatToolProgressTitle(summary: ToolCallSummary, status: "started" | "completed" | "error"): string | undefined;
export declare function formatToolProgressDetails(summary: ToolCallSummary, options?: ChannelTurnProgressBuilderOptions): string | undefined;
export {};
//# sourceMappingURL=progress-formatting.d.ts.map