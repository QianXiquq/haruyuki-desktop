import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { ApprovalCreate } from "@letta-ai/letta-client/resources/agents/messages";
import type { ApprovalResult } from "./approval-execution";
type OutgoingMessage = MessageCreate | ApprovalCreate;
export type ApprovalNormalizationOptions = {
    /**
     * Structured interrupt provenance: tool_call_ids known to have been interrupted.
     * When provided, these IDs are forced to persist as status=error.
     */
    interruptedToolCallIds?: Iterable<string>;
    /**
     * Temporary fallback guard for legacy drift where tool_return text is the only
     * interrupt signal. Keep false by default for strict structured behavior.
     */
    allowInterruptTextFallback?: boolean;
};
export declare function normalizeApprovalResultsForPersistence(approvals: ApprovalResult[] | null | undefined, options?: ApprovalNormalizationOptions): ApprovalResult[];
export declare function normalizeOutgoingApprovalMessages(messages: OutgoingMessage[], options?: ApprovalNormalizationOptions): OutgoingMessage[];
export {};
//# sourceMappingURL=approval-result-normalization.d.ts.map