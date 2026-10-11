/**
 * Utilities for sending messages to an agent via conversations
 **/
import type { Stream } from "@letta-ai/letta-client/core/streaming";
import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { ApprovalCreate, LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
import type { MessageCreateParams as ConversationMessageCreateParams } from "@letta-ai/letta-client/resources/conversations/messages";
import type { SkillSource } from "./skill-sources";
import { type Backend } from "../backend";
import { type ClientTool, type PreparedToolExecutionContext } from "../tools/manager";
import type { PermissionModeState } from "../tools/permission-mode-state";
import { type ImageFailureModesByMessageOtid } from "../utils/message-image-normalization";
import { type ApprovalNormalizationOptions } from "./approval-result-normalization";
export type StreamRequestContext = {
    conversationId: string;
    resolvedConversationId: string;
    agentId: string | null;
    requestStartedAtMs: number;
    otid?: string;
};
export declare function getStreamRequestStartTime(stream: Stream<LettaStreamingResponse>): number | undefined;
export declare function getStreamToolContextId(stream: Stream<LettaStreamingResponse>): string | null;
export declare function getStreamRequestContext(stream: Stream<LettaStreamingResponse>): StreamRequestContext | undefined;
export type SendMessageStreamOptions = {
    streamTokens?: boolean;
    background?: boolean;
    agentId?: string;
    approvalNormalization?: ApprovalNormalizationOptions;
    workingDirectory?: string;
    /** Per-conversation permission mode state. When provided, tool execution uses
     *  this scoped state instead of the global permissionMode singleton. */
    permissionModeState?: PermissionModeState;
    /** Per-request skill sources. An empty array disables client skills. */
    skillSources?: SkillSource[];
    /**
     * Per-request model override. Uses backend request-scoped override_model and
     * does not mutate agent/conversation persisted model configuration.
     */
    overrideModel?: string;
    /** Request-scoped Messages API response format. */
    responseFormat?: Record<string, unknown>;
    /** Explicit turn-scoped tool snapshot. When present, bypasses the global registry. */
    preparedToolContext?: PreparedToolExecutionContext;
    /**
     * Allow sending a cached previous response id for this request. Callers should
     * set this only for approval continuations that were fully auto-handled by
     * the client, with no human approval/denial in the loop.
     */
    allowResponseStateReuse?: boolean;
    /**
     * Per-message failure policy for best-effort channel attachments. Images are
     * always normalized; entries here only choose whether a failed conversion is
     * dropped instead of failing the request.
     */
    imageFailureModesByMessageOtid?: ImageFailureModesByMessageOtid;
};
export type SendMessageStreamRequestOptions = {
    maxRetries?: number;
    signal?: AbortSignal;
    headers?: Record<string, string>;
};
export declare function buildConversationMessagesCreateRequestBody(conversationId: string, messages: Array<MessageCreate | ApprovalCreate>, opts: SendMessageStreamOptions | undefined, clientTools: ClientTool[], clientSkills?: NonNullable<ConversationMessageCreateParams["client_skills"]>): {
    agent_id?: string | undefined;
    response_format?: Record<string, unknown> | undefined;
    override_model?: string | undefined;
    messages: (MessageCreate | ApprovalCreate)[];
    streaming: boolean;
    stream_tokens: boolean;
    include_pings: boolean;
    background: boolean;
    client_skills: ConversationMessageCreateParams.ClientSkill[];
    client_tools: ClientTool[];
    include_compaction_messages: boolean;
};
/**
 * Send a message to a conversation and return a streaming response.
 * Uses the conversations API for all conversations.
 *
 * For the "default" conversation (agent's primary message history without
 * an explicit conversation object), pass conversationId="default" and
 * provide agentId in opts. The agent id is sent in the request body.
 */
export declare function sendMessageStream(conversationId: string, messages: Array<MessageCreate | ApprovalCreate>, opts?: SendMessageStreamOptions, requestOptions?: SendMessageStreamRequestOptions): Promise<Stream<LettaStreamingResponse>>;
/**
 * Send a message through an explicit backend instance. Use this when a caller
 * composes several backend operations and needs fork/send to stay on the same
 * backend without reaching back through the global backend singleton.
 */
export declare function sendMessageStreamWithBackend(backend: Backend, conversationId: string, messages: Array<MessageCreate | ApprovalCreate>, opts?: SendMessageStreamOptions, requestOptions?: SendMessageStreamRequestOptions): Promise<Stream<LettaStreamingResponse>>;
//# sourceMappingURL=message.d.ts.map