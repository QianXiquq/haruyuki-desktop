import type { AssistantMessage, Context, Model, SimpleStreamOptions } from "@earendil-works/pi-ai";
import { LocalPiModelsRuntime } from "../dev/pi-models-runtime";
import type { LocalMessage } from "./local-message";
import type { LocalAgentRecord } from "./local-types";
import type { TrimStartSource } from "./topic-compaction";
export declare const LOCAL_SUMMARY_TOOL_RETURN_TRUNCATION_CHARS = 2000;
export declare const LOCAL_DEFAULT_COMPACTION_MODE = "sliding_window";
export declare const LOCAL_DEFAULT_SLIDING_WINDOW_PERCENTAGE = 0.3;
export type LocalCompactionMode = "sliding_window";
export declare class LocalSlidingWindowCompactionPlanningError extends Error {
    constructor(message: string);
}
export declare function isLocalSlidingWindowCompactionPlanningError(error: unknown): error is LocalSlidingWindowCompactionPlanningError;
export declare const LOCAL_SLIDING_WINDOW_COMPACTION_PROMPT = "The following messages are being evicted from the BEGINNING of your context window. Write a detailed summary that captures what happened in these messages to appear BEFORE the remaining recent messages in context, providing background for what comes after. Include the following sections:\n\n1.**High level goals**: What is the high level goal and ongoing task? Capture the user's explicit requests and intent in detail. If there is an existing summary in the transcript, make sure to take it into consideration to continue tracking the higher level goals and long-term progress.\n\n2. **What happened**: The conversations, tasks, and exchanges that took place. What did the user ask for? What did you do? How did things progress? If there is a previous summary being evicted, please extract a concise version of the critical info from it.\n\n3. **Important details**: Enumerate specific files and code sections examined, modified, or created, as well as important plan files, GitHub issues/PR links, and Linear ticket IDs. For each item, include why it matters and any relevant names, data, configs, or facts discussed.\n   - **Preserve identifiers verbatim** (plan filename/path, exact URL, issue/PR number, ticket ID); do not paraphrase or truncate.\n   - **Preserve referenced identifiers unless explicitly resolved**: Keep exact URLs/IDs from the conversation unless there is clear evidence they are no longer relevant.\n   - Do not omit details likely to be referenced later.\n\n4. **Errors and fixes**: List all errors that you ran into, and how you fixed them. Pay special attention to specific user feedback that you received and record verbatim if useful.\n\n5. **Lookup hints**: For any detailed content (long lists, extensive data, specific conversations) that couldn't fit in the summary, note the topic and key terms that could be used to find it in message history later.\n\nWrite in first person as a factual record of what occurred. Be thorough and detailed - the goal is to preserve enough context that the recent messages make sense and important information isn't lost to prevent duplicate work or repeated mistakes.\n\nKeep your summary under 300 words. Only output the summary.";
export interface LocalCompactionStats {
    trigger?: string;
    context_tokens_before?: number;
    context_tokens_after?: number;
    context_window?: number;
    messages_count_before?: number;
    messages_count_after?: number;
    /**
     * Audit trail for a user-picked topic trim, persisted on the `compaction`
     * transcript row so a later reader can tell a topic cut from a plain
     * sliding-window one, and can see how far the boundary was rewound and whether
     * the retention cap overrode the picked topic.
     */
    trim?: LocalTrimStats;
}
export interface LocalTrimStats {
    source: TrimStartSource;
    topic_title: string | null;
    summarized_titles: string[];
    /** User turns rewound from the marker anchor to the effective boundary. */
    rewind_turns: number;
    /** Retention the request asked for, before the ratio cap. */
    requested_retention_tokens: number;
    /** Retention actually written back. */
    retention_tokens: number;
    retention_cap_tokens: number | null;
}
export type LocalCompleteFunction = (model: Model<string>, context: Context, options?: SimpleStreamOptions & Record<string, unknown>) => Promise<AssistantMessage>;
export interface LocalCompactionSummaryInput {
    conversationId: string;
    agent: LocalAgentRecord;
    messages: LocalMessage[];
    complete?: LocalCompleteFunction;
    prompt?: string | null;
    clipChars?: number | null;
    abortSignal?: AbortSignal;
    localProviderAuthStorageDir?: string;
    modelsRuntime?: LocalPiModelsRuntime;
}
export interface LocalSlidingWindowCompactionPlan {
    messagesToSummarize: LocalMessage[];
    messagesToKeep: LocalMessage[];
    cutoffIndex: number;
}
export declare function formatLocalMessagesForSummary(messages: LocalMessage[], options?: {
    truncationChars?: number;
    maxChars?: number;
}): string;
/**
 * The one place a raw `sliding_window_percentage` becomes a usable ratio.
 *
 * `undefined`/`NaN` fall back to the default, anything at or below zero means the
 * smallest eviction step (0.1), and anything above 1 is clamped to the whole
 * window. Both the summarizer planner and the topic trim's retention cap read the
 * ratio through here, so the two can never disagree about what a setting means.
 */
export declare function normalizedSlidingWindowPercentage(value: number | undefined): number;
/**
 * Plan a sliding-window trim: summarize the oldest messages until what is kept
 * fits `(1 - rate) x` the transcript's own length.
 *
 * The base is the transcript, not the model's window. `sliding_window_percentage`
 * is a **compression rate**: it compresses a share of the conversation that is
 * actually there, so the target is relative to that length and a trim is possible
 * at any point. The window only bounds what may be *sent*
 * (`backend/dev/provider-turn-executor.ts`), never how much a trim keeps.
 */
export declare function planLocalSlidingWindowCompaction(messages: LocalMessage[], options?: {
    slidingWindowPercentage?: number;
}): LocalSlidingWindowCompactionPlan;
export declare function summarizeLocalMessagesSlidingWindow(input: LocalCompactionSummaryInput): Promise<string>;
export declare function estimateLocalMessageTokens(messages: LocalMessage[]): number;
export declare function packageLocalSummaryMessage(summary: string, stats?: LocalCompactionStats, mode?: LocalCompactionMode): string;
//# sourceMappingURL=compaction.d.ts.map