import type { Stream } from "@letta-ai/letta-client/core/streaming";
import type { LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
import type { StopReasonType } from "@letta-ai/letta-client/resources/runs/runs";
import { type createBuffers } from "./accumulator";
import type { ContextTracker } from "./context-tracker";
import type { ApprovalRequest, ErrorInfo, StreamSequenceCursor } from "./stream-processor";
import { advanceStreamSequenceCursor, StreamProcessor } from "./stream-processor";
import { type StreamResumePolicy } from "./stream-resume";
export { advanceStreamSequenceCursor };
export type { ApprovalRequest, StreamSequenceCursor } from "./stream-processor";
export declare function recordEmptyApprovalTelemetry(runId: string | null | undefined, cursor: StreamSequenceCursor | null): void;
export type DrainStreamHookContext = {
    chunk: LettaStreamingResponse;
    shouldOutput: boolean;
    errorInfo?: ErrorInfo;
    updatedApproval?: ApprovalRequest;
    streamProcessor: StreamProcessor;
};
export type DrainStreamHookResult = {
    shouldOutput?: boolean;
    shouldAccumulate?: boolean;
    stopReason?: StopReasonType;
};
export type DrainStreamHook = (ctx: DrainStreamHookContext) => DrainStreamHookResult | undefined | Promise<DrainStreamHookResult | undefined>;
export type DrainResult = {
    stopReason: StopReasonType;
    sawStopReasonChunk?: boolean;
    lastRunId?: string | null;
    lastSeqId?: number | null;
    approval?: ApprovalRequest | null;
    approvals?: ApprovalRequest[];
    apiDurationMs: number;
    fallbackError?: string | null;
    errorInfo?: ErrorInfo;
    terminalEofGuardFired?: boolean;
    stallReconcilerFired?: boolean;
};
export declare function drainStream(stream: Stream<LettaStreamingResponse>, buffers: ReturnType<typeof createBuffers>, refresh: () => void, abortSignal?: AbortSignal, onFirstMessage?: () => void, onChunkProcessed?: DrainStreamHook, contextTracker?: ContextTracker, seenSequenceCursor?: StreamSequenceCursor | null, isResumeStream?: boolean, skipCancelToolsOnError?: boolean): Promise<DrainResult>;
/**
 * Drain a stream with automatic resume on disconnect.
 *
 * If the stream ends without receiving a proper stop_reason chunk (indicating
 * an unexpected disconnect), this will automatically attempt to resume from
 * Redis using the last received run_id and seq_id.
 *
 * @param stream - Initial stream from agent.messages.stream()
 * @param buffers - Buffer to accumulate chunks
 * @param refresh - Callback to refresh UI
 * @param abortSignal - Optional abort signal for cancellation
 * @param onFirstMessage - Optional callback to invoke on first message chunk
 * @param onChunkProcessed - Optional hook to observe/override per-chunk behavior
 * @returns Result with stop_reason, approval info, and timing
 */
export declare function drainStreamWithResume(stream: Stream<LettaStreamingResponse>, buffers: ReturnType<typeof createBuffers>, refresh: () => void, abortSignal?: AbortSignal, onFirstMessage?: () => void, onChunkProcessed?: DrainStreamHook, contextTracker?: ContextTracker, seenSequenceCursor?: StreamSequenceCursor | null, resumePolicy?: StreamResumePolicy): Promise<DrainResult>;
//# sourceMappingURL=stream.d.ts.map