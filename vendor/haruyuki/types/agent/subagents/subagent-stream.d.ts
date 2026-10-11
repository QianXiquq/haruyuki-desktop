import type { EnqueueReceipt } from "../../backend/api/conversation-enqueue";
import type { SubagentResult } from ".";
/**
 * State tracked during subagent execution
 */
export interface ExecutionState {
    agentId: string | null;
    conversationId: string | null;
    finalResult: string | null;
    finalError: string | null;
    /**
     * Set when the child submitted a computer-routed send with `--no-wait` and
     * exited with the enqueue receipt instead of a reply. The parent tracks the
     * remote turn from this receipt.
     */
    enqueueReceipt: EnqueueReceipt | null;
    resultStats: {
        durationMs: number;
        totalTokens: number;
        stepCount?: number;
    } | null;
    displayedToolCalls: Set<string>;
    toolCallStatuses: Map<string, "success" | "error">;
}
/**
 * Error text of a failed result envelope. Cloud-routed sends emit
 * `{ result: null, error: "<text>" }`; local turns put the text in `result`.
 */
export declare function getResultEnvelopeError(event: {
    result?: string | null;
    error?: string | null;
}): string;
/**
 * Process a single JSON event from the subagent stream
 */
export declare function processStreamEvent(line: string, state: ExecutionState, subagentId: string): void;
/** Whether at least one identified tool call reached a successful terminal state. */
export declare function hasSuccessfulToolCall(state: ExecutionState): boolean;
/**
 * Whether a subagent's stream-json stdout ends mid-line: the final segment has
 * no line terminator and is non-empty but not valid JSON. A healthy stream ends
 * with a complete result envelope, so a partial trailing line is unambiguous
 * evidence the tail was truncated in transit (#3257). Complete-but-unexpected
 * output (the final line parses, has a terminator, or stdout is empty) is NOT
 * treated as truncation — the child may have already performed side effects,
 * so callers only retry the clear case.
 */
export declare function looksLikeTruncatedStreamJson(stdout: string): boolean;
/**
 * Parse the final result from stdout if not captured during streaming
 */
export declare function parseResultFromStdout(stdout: string, agentId: string | null): SubagentResult;
/**
 * Error text for a child that exited without delivering a result envelope.
 * Names the exit code or signal first; the stderr tail is supporting detail,
 * because on a normal startup it holds only progress logging.
 */
export declare function describeSubagentExit(exitCode: number | null, exitSignal: NodeJS.Signals | null, stderr: string): string;
//# sourceMappingURL=subagent-stream.d.ts.map