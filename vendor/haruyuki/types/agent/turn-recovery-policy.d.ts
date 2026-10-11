/**
 * Pure, framework-agnostic policy helpers for turn-level recovery.
 *
 * Both TUI (App.tsx) and headless (headless.ts) consume these helpers
 * so that identical conflict inputs always produce the same recovery
 * action. No network calls, no React, no stream-json output.
 */
import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { ApprovalCreate } from "@letta-ai/letta-client/resources/agents/messages";
import type { StopReasonType } from "../types/protocol_v2";
/**
 * Explicit classifier for quota-limit style errors that should not use
 * transient retry logic. Used by client-side fallback paths.
 */
export declare function isQuotaLimitErrorDetail(detail: unknown): boolean;
/** Tool call IDs don't match what the server expects. */
export declare function isInvalidToolCallIdsError(detail: unknown): boolean;
/** Backend has a pending approval blocking new messages. */
export declare function isApprovalPendingError(detail: unknown): boolean;
/** Conversation is busy (another request is being processed). */
export declare function isConversationBusyError(detail: unknown): boolean;
/** Extract the server-reported blocking run id from a conversation-busy error. */
export declare function extractConversationBusyRunId(detail: unknown): string | null;
/**
 * LLM returned an empty response (no content and no tool calls).
 * This can happen with models like Opus 4.6 that occasionally return empty content.
 * These are retryable with a cache-busting system message modification.
 */
export declare function isEmptyResponseError(detail: unknown): boolean;
/** Transient provider/network detail that is usually safe to retry. */
export declare function isRetryableProviderErrorDetail(detail: unknown): boolean;
/** Non-transient auth/validation style provider detail that should not be retried. */
export declare function isNonRetryableProviderErrorDetail(detail: unknown): boolean;
/** Retry decision for run-metadata fallback classification. */
export declare function shouldRetryRunMetadataError(errorType: unknown, detail: unknown): boolean;
export declare function shouldRetryPostStreamRunError(opts: {
    stopReason: StopReasonType;
    errorType?: unknown;
    detail?: unknown;
    retryable?: boolean;
}): boolean;
export declare function normalizeStreamErrorTypeToStopReason(errorType: unknown): StopReasonType;
/**
 * Check if this is an empty response error that should be retried.
 *
 * Empty responses from models like Opus 4.6 are retryable. The caller
 * decides whether to retry with the same input or append a system
 * reminder nudge (typically on the last attempt).
 */
export declare function isEmptyResponseRetryable(errorType: unknown, detail: unknown, emptyResponseRetries: number, maxEmptyResponseRetries: number): boolean;
/** Retry decision for pre-stream send failures before any chunks are yielded. */
export declare function shouldRetryPreStreamTransientError(opts: {
    status: number | undefined;
    detail: unknown;
}): boolean;
/** Parse Retry-After header to milliseconds (seconds or HTTP-date forms). */
export declare function parseRetryAfterHeaderMs(retryAfterValue: string | null | undefined): number | null;
export type RetryDelayCategory = "transient_provider" | "conversation_busy" | "empty_response";
/**
 * Compute retry delay for known retry classes.
 * - `transient_provider`: exponential (Cloudflare-specific base) with Retry-After override
 * - `conversation_busy`: exponential
 * - `empty_response`: linear
 */
export declare function getRetryDelayMs(opts: {
    category: RetryDelayCategory;
    attempt: number;
    detail?: unknown;
    retryAfterMs?: number | null;
}): number;
/**
 * Backward-compatible wrapper for transient provider retries.
 */
export declare function getTransientRetryDelayMs(opts: {
    attempt: number;
    detail: unknown;
    retryAfterMs?: number | null;
}): number;
export type PreStreamConflictKind = "approval_pending" | "conversation_busy" | null;
export type PreStreamErrorAction = "resolve_approval_pending" | "retry_conversation_busy" | "retry_transient" | "rethrow";
export interface PreStreamErrorOptions {
    status?: number;
    transientRetries?: number;
    maxTransientRetries?: number;
}
/** Classify a pre-stream 409 conflict detail string. */
export declare function classifyPreStreamConflict(detail: unknown): PreStreamConflictKind;
/** Determine the recovery action for a pre-stream 409 error. */
export declare function getPreStreamErrorAction(detail: unknown, conversationBusyRetries: number, maxConversationBusyRetries: number, opts?: PreStreamErrorOptions): PreStreamErrorAction;
/**
 * Extract error detail string from a pre-stream APIError's nested body.
 *
 * Handles the common SDK error shapes:
 * - Nested: `e.error.error.detail` → `e.error.error.message`
 * - Direct: `e.error.detail` → `e.error.message`
 * - Error: `e.message`
 *
 * Checks `detail` first (specific) then `message` (generic) at each level.
 */
export declare function extractConflictDetail(error: unknown): string;
export interface PendingApprovalInfo {
    toolCallId: string;
    toolName: string;
    toolArgs: string;
}
export declare const STALE_APPROVAL_RECOVERY_DENIAL_REASON = "The agent harness automatically closed this stale pending tool call to recover from a client/server state desync: the server was still waiting on a result for it, but the harness had no matching tool execution in flight and no result was ever recorded. It was not denied by the user or a permissions policy. Re-issue the tool call if you still need it.";
export declare function buildFreshDenialApprovals(serverApprovals: PendingApprovalInfo[], denialReason: string): NonNullable<ApprovalCreate["approvals"]>;
/**
 * Post-stop retries create a new request/run and must not reuse OTIDs.
 */
export declare function refreshInputOtidsForNewRequest<T extends MessageCreate | ApprovalCreate>(currentInput: T[]): T[];
/**
 * Strip stale approval payloads from the message input array and optionally
 * prepend fresh denial results for the actual pending approvals from the server.
 */
export declare function rebuildInputWithFreshDenials(currentInput: Array<MessageCreate | ApprovalCreate>, serverApprovals: PendingApprovalInfo[], denialReason: string): Array<MessageCreate | ApprovalCreate>;
/**
 * Decide whether an approval-pending recovery attempt should proceed.
 * Centralizes the retry-budget check used by both TUI and headless.
 */
export declare function shouldAttemptApprovalRecovery(opts: {
    approvalPendingDetected: boolean;
    retries: number;
    maxRetries: number;
}): boolean;
export interface ChatGPTUsageLimitDetail {
    planType: string | null;
    /** Absolute reset time in ms since epoch, when the server reported one. */
    resetsAt: number | null;
}
export interface ChatGPTUsageLimitErrorInput {
    message?: unknown;
    detail?: unknown;
    errorCode?: unknown;
    error_code?: unknown;
    raw?: unknown;
}
/**
 * Parse a ChatGPT usage-limit error from the structured Cloud error event or
 * from the older embedded-JSON detail string. Reset fields are best-effort.
 */
export declare function parseChatGPTUsageLimitDetail(error: unknown): ChatGPTUsageLimitDetail | null;
export interface ChatGPTFailoverModelEntry {
    handle: string;
    providerType?: string;
    providerCategory?: string;
}
/**
 * Pick a sibling ChatGPT plan handle to fail over to when the current plan
 * hits its usage limit. The current handle must itself resolve to a
 * chatgpt_oauth BYOK model in `models` (otherwise returns null). Siblings
 * share the same model suffix (after the first `/`) under a different
 * provider prefix, are chatgpt_oauth + byok, and are not in
 * `exhaustedProviders`. One sibling is chosen uniformly at random.
 */
export declare function selectChatGPTQuotaFailoverHandle(params: {
    currentHandle: string;
    models: ChatGPTFailoverModelEntry[];
    exhaustedProviders: ReadonlySet<string>;
    random?: () => number;
}): string | null;
//# sourceMappingURL=turn-recovery-policy.d.ts.map