import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { Message } from "@letta-ai/letta-client/resources/agents/messages";
import { ApiRequestError, apiRequest } from "./request";
/** Only the server's explicit pre-admission rejection proves a POST was not accepted. */
export declare function isProvenCloudApiShutdownRejection(error: unknown): error is ApiRequestError;
export interface EnqueueReceipt {
    status: "queued";
    agent_id: string;
    conversation_id: string;
    client_message_id: string;
    workflow_id: string;
    super_run_id: string;
    /** Listener selected for a managed Agent launch, used only for cancellation. */
    connection_id?: string;
}
export interface EnqueueConversationInput {
    agentId: string;
    conversationId: string;
    clientMessageId: string;
    content: MessageCreate["content"];
    computer?: string;
}
/** Cloud owns delivery after this request returns 202. Never retry by executing locally. */
export declare function enqueueConversationMessage(input: EnqueueConversationInput, signal?: AbortSignal, request?: typeof apiRequest): Promise<EnqueueReceipt>;
/** Remove this input from either the Cloud delivery queue or listener queue. */
export declare function dequeueConversationMessage(input: Pick<EnqueueConversationInput, "agentId" | "conversationId" | "clientMessageId">, signal?: AbortSignal, request?: typeof apiRequest): Promise<{
    client_message_id: string;
    status: "dequeued" | "already_dequeued" | "too_late" | "not_found";
}>;
/** Relevant fields from the existing Cloud conversation Super Run feed. */
export interface ConversationSendStatus {
    conversation_id: string;
    active_super_runs: Array<{
        id: string;
        status: string;
    }>;
    runtime_status: {
        state: string;
        loop_state: {
            status: string;
            client_message_ids_by_run_id?: Record<string, string[]>;
        } | null;
    } | null;
}
export type ConversationStatusEvent = {
    type: "conversation_super_run_snapshot";
    statuses: ConversationSendStatus[];
} | {
    type: "conversation_super_run_update";
    conversation_id: string;
    status: ConversationSendStatus | null;
};
export declare function openConversationStatusStream(agentId: string, controller: AbortController): Promise<AsyncIterable<ConversationStatusEvent>>;
export declare function listEnqueuedRunMessages(runId: string, signal?: AbortSignal): Promise<Message[]>;
export interface LatestConversationSuperRun {
    id: string;
    status: string;
    completed_at: string | null;
    cancelled_at: string | null;
    errored_at: string | null;
}
export interface ExactSuperRun extends LatestConversationSuperRun {
    error: {
        code: string;
        message: string;
    } | null;
    /** Associated child runs, newest first. */
    run_ids: string[];
}
/** Read the accepted Super Run and its server-owned result correlation. */
export declare function getExactSuperRun(agentId: string, superRunId: string, signal?: AbortSignal, request?: typeof apiRequest): Promise<ExactSuperRun>;
export declare function getLatestConversationSuperRun(conversationId: string, signal?: AbortSignal): Promise<LatestConversationSuperRun>;
//# sourceMappingURL=conversation-enqueue.d.ts.map