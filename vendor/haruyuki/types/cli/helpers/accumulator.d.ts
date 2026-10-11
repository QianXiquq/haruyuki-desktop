import type { LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
import type { ContextTracker } from "./context-tracker";
type CompactionSummaryMessageChunk = {
    message_type: "summary_message";
    id?: string;
    otid?: string;
    summary?: string;
    compaction_stats?: {
        trigger?: string;
        context_tokens_before?: number;
        context_tokens_after?: number;
        context_window?: number;
        messages_count_before?: number;
        messages_count_after?: number;
    };
};
type CompactionEventMessageChunk = {
    message_type: "event_message";
    id?: string;
    otid?: string;
    event_type?: string;
    event_data?: Record<string, unknown>;
};
type StreamingChunk = LettaStreamingResponse | CompactionSummaryMessageChunk | CompactionEventMessageChunk;
/**
 * A line of streaming output with its source (stdout or stderr).
 */
export interface StreamingLine {
    text: string;
    isStderr: boolean;
}
/**
 * Streaming state for bash/shell tools.
 * Tracks a rolling window of output during execution.
 */
export interface StreamingState {
    tailLines: StreamingLine[];
    partialLine: string;
    partialIsStderr: boolean;
    totalLineCount: number;
    startTime: number;
}
/**
 * Append a chunk of output to the streaming state.
 * Maintains a tail buffer of the last N lines and handles partial line accumulation.
 */
export declare function appendStreamingOutput(state: StreamingState | undefined, chunk: string, startTime: number, isStderr?: boolean): StreamingState;
export type Line = {
    kind: "user";
    id: string;
    text: string;
    messageId?: string;
    otid?: string;
} | {
    kind: "reasoning";
    id: string;
    text: string;
    phase: "streaming" | "finished";
    isContinuation?: boolean;
    messageId?: string;
    startedAtMs?: number;
    durationMs?: number;
} | {
    kind: "assistant";
    id: string;
    text: string;
    phase: "streaming" | "finished";
    isContinuation?: boolean;
    messageId?: string;
} | {
    kind: "tool_call";
    id: string;
    toolCallId?: string;
    name?: string;
    argsText?: string;
    unifiedExecCommandDisplay?: string;
    resultText?: string;
    resultOk?: boolean;
    phase: "streaming" | "ready" | "running" | "finished";
    streaming?: StreamingState;
} | {
    kind: "error";
    id: string;
    text: string;
} | {
    kind: "event";
    id: string;
    eventType: string;
    eventData: Record<string, unknown>;
    phase: "running" | "finished";
    summary?: string;
    stats?: {
        trigger?: string;
        contextTokensBefore?: number;
        contextTokensAfter?: number;
        contextWindow?: number;
        messagesCountBefore?: number;
        messagesCountAfter?: number;
    };
} | {
    kind: "command";
    id: string;
    input: string;
    output: string;
    phase?: "running" | "waiting" | "finished";
    success?: boolean;
    dimOutput?: boolean;
    preformatted?: boolean;
} | {
    kind: "bash_command";
    id: string;
    input: string;
    output: string;
    phase?: "running" | "finished";
    success?: boolean;
    streaming?: StreamingState;
} | {
    kind: "status";
    id: string;
    lines: string[];
} | {
    kind: "trajectory_summary";
    id: string;
    durationMs: number;
    stepCount: number;
    verb: string;
} | {
    kind: "separator";
    id: string;
};
/**
 * Tracks server-side tool calls for hook triggering.
 * Server-side tools (tool_call_message) are executed by the haruyuki server,
 * not the client, so we need to trigger hooks when we receive the stream messages.
 */
export interface ServerToolCallInfo {
    toolName: string;
    toolArgs: string;
    preToolUseTriggered: boolean;
}
export type Buffers = {
    tokenCount: number;
    order: string[];
    byId: Map<string, Line>;
    pendingToolByRun: Map<string, string>;
    toolCallIdToLineId: Map<string, string>;
    userLineIdByOtid: Map<string, string>;
    lastOtid: string | null;
    assistantCanonicalByMessageId: Map<string, string>;
    assistantCanonicalByOtid: Map<string, string>;
    reasoningCanonicalByMessageId: Map<string, string>;
    reasoningCanonicalByOtid: Map<string, string>;
    pendingRefresh?: boolean;
    interrupted?: boolean;
    commitGeneration?: number;
    abortGeneration?: number;
    lastReasoning?: string;
    lastAssistantMessage?: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cachedInputTokens: number;
        cacheWriteTokens: number;
        reasoningTokens: number;
        contextTokens?: number;
        stepCount: number;
    };
    tokenStreamingEnabled?: boolean;
    splitCounters: Map<string, number>;
    serverToolCalls: Map<string, ServerToolCallInfo>;
    unifiedExecSessionCommands: Map<string, string>;
    approvalsPending: boolean;
    agentId?: string;
};
export declare function createBuffers(agentId?: string): Buffers;
export declare function upsertStatusLine(b: Buffers, id: string, lines: string[]): void;
/**
 * Mark the current (last) line as finished when the stream ends.
 * Call this after stream completion to ensure the final line isn't stuck in "streaming" state.
 */
export declare function markCurrentLineAsFinished(b: Buffers): void;
/**
 * Mark any incomplete tool calls as cancelled when stream is interrupted.
 * This prevents blinking tool calls from staying in progress state.
 * @param b - The buffers object
 * @param setInterruptedFlag - Whether to set the interrupted flag (default true).
 *   Pass false when clearing stale tool calls at stream startup to avoid race conditions
 *   with concurrent processConversation calls reading the flag.
 * @param reason - Why the cancellation is happening.
 * @param skipMarkCurrentLine - When true, do NOT call markCurrentLineAsFinished.
 *   Use this when a stream resume will follow: the resume stream will finalize the
 *   streaming line with its full text, so prematurely marking it finished would
 *   cause it to be committed to static with truncated content.
 * @returns true if any tool calls were marked as cancelled
 */
export type CancelReason = "user_interrupt" | "stream_error" | "internal_cancel" | "approval_cancel";
export declare function markIncompleteToolsAsCancelled(b: Buffers, setInterruptedFlag?: boolean, reason?: CancelReason, skipMarkCurrentLine?: boolean): boolean;
/**
 * Remove incomplete tool calls from the buffer entirely.
 * Used to clean up orphaned/failed-run tool calls without showing "Cancelled".
 * Returns true if any tools were removed.
 */
export declare function removeIncompleteTools(b: Buffers, reason?: string): boolean;
export declare function extractTextPart(v: unknown): string;
export declare function onChunk(b: Buffers, chunk: StreamingChunk, ctx?: ContextTracker): void;
export declare function toLines(b: Buffers): Line[];
/** Returns the text of the most recent non-empty assistant line, if any. */
export declare function findLastAssistantText(lines: Line[]): string | undefined;
/**
 * Set tool calls to "running" phase before execution.
 * This updates the UI to show the formatted args instead of ellipsis.
 */
export declare function setToolCallsRunning(b: Buffers, toolCallIds: string[]): void;
/**
 * Serialize display lines into a plain-text conversation transcript.
 * Used to pass current conversation context to the reflection subagent.
 */
export declare function linesToTranscript(lines: Line[]): string;
export {};
//# sourceMappingURL=accumulator.d.ts.map