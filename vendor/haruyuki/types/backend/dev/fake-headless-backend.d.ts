import type { Stream } from "@letta-ai/letta-client/core/streaming";
import type { AgentState } from "@letta-ai/letta-client/resources/agents/agents";
import type { LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
import type { Conversation } from "@letta-ai/letta-client/resources/conversations/conversations";
import type { Backend, BackendCapabilities, ConversationCreateBody, ConversationMessageCreateBody, ConversationMessageStreamBody, ConversationResumeTail, ConversationResumeTailOptions, RunMessageStreamBody } from "../backend";
import { LocalStore, type LocalStoreOptions } from "../local/local-store";
import type { LocalAgentRecord } from "../local/local-types";
import { type HeadlessTurnExecutor } from "./headless-turn-executor";
export interface HeadlessBackendOptions {
    modelHandle?: string;
    runIdPrefix?: string;
    runMetadataBackend?: string;
}
/**
 * A turn prefix resolved by {@link HeadlessBackend.resolveSystemPromptForTurn}.
 * Backends that freeze the conversation prefix (local backend) return the frozen
 * agent (model/params), the frozen `client_tools`, and the frozen system prompt;
 * plain backends just return the system prompt string.
 */
export interface ResolvedTurnPrefix {
    systemPrompt: string;
    agent?: LocalAgentRecord;
    clientTools?: unknown[];
}
export declare const HEADLESS_BACKEND_CAPABILITIES: BackendCapabilities;
export declare class HeadlessBackend implements Backend {
    readonly capabilities: BackendCapabilities;
    protected readonly store: LocalStore;
    private readonly executor;
    private readonly runs;
    private readonly activeRunByConversation;
    private readonly runControllerByRunId;
    private readonly runChunksByRunId;
    private readonly modelHandle;
    private readonly runIdPrefix;
    private readonly runMetadataBackend;
    private runSeq;
    constructor(agentId?: string, executor?: HeadlessTurnExecutor, storeOptions?: LocalStoreOptions, options?: HeadlessBackendOptions);
    retrieveAgent(agentId: string): Promise<AgentState>;
    listAgents(...args: Parameters<Backend["listAgents"]>): Promise<never>;
    deleteAgent(...args: Parameters<Backend["deleteAgent"]>): Promise<never>;
    updateAgent(...args: Parameters<Backend["updateAgent"]>): Promise<AgentState>;
    createAgent(...args: Parameters<Backend["createAgent"]>): Promise<AgentState>;
    retrieveConversation(conversationId: string): Promise<Conversation>;
    listConversations(...args: Parameters<Backend["listConversations"]>): Promise<never>;
    createConversation(body: ConversationCreateBody): Promise<Conversation>;
    updateConversation(...args: Parameters<Backend["updateConversation"]>): Promise<Conversation>;
    recompileConversation(..._args: Parameters<Backend["recompileConversation"]>): ReturnType<Backend["recompileConversation"]>;
    listConversationMessages(...args: Parameters<Backend["listConversationMessages"]>): ReturnType<Backend["listConversationMessages"]>;
    compactConversationMessages(..._args: Parameters<Backend["compactConversationMessages"]>): ReturnType<Backend["compactConversationMessages"]>;
    listAgentMessages(...args: Parameters<Backend["listAgentMessages"]>): ReturnType<Backend["listAgentMessages"]>;
    retrieveMessage(...args: Parameters<Backend["retrieveMessage"]>): ReturnType<Backend["retrieveMessage"]>;
    getConversationResumeTail(agentId: string, conversationId: string, options: ConversationResumeTailOptions): Promise<ConversationResumeTail>;
    listModels(): ReturnType<Backend["listModels"]>;
    createConversationMessageStream(conversationId: string, body: ConversationMessageCreateBody): Promise<Stream<LettaStreamingResponse>>;
    streamConversationMessages(conversationId: string, body: ConversationMessageStreamBody): Promise<Stream<LettaStreamingResponse>>;
    cancelConversation(...args: Parameters<Backend["cancelConversation"]>): Promise<never>;
    cancelRun(...args: Parameters<Backend["cancelRun"]>): Promise<never>;
    private cancelRunById;
    cancelConversationRun(...args: Parameters<Backend["cancelConversationRun"]>): Promise<never>;
    retrieveRun(runId: string): Promise<never>;
    streamRunMessages(runId: string, body: RunMessageStreamBody): Promise<never>;
    forkConversation(...args: Parameters<Backend["forkConversation"]>): Promise<{
        id: string;
    }>;
    private executeConversationTurn;
    protected resolveSystemPromptForTurn(input: {
        conversationId: string;
        agentId: string;
        agent: ReturnType<LocalStore["retrieveAgentRecord"]>;
        body: ConversationMessageCreateBody | ConversationMessageStreamBody;
        history: ReturnType<LocalStore["listConversationMessages"]>;
        uiMessages: ReturnType<LocalStore["listLocalMessages"]>;
    }): Promise<string | ResolvedTurnPrefix>;
    private startRun;
    private completeRun;
    private failRun;
    private findActiveRunByAgentId;
    private recordRunChunk;
    private persistExecutorStream;
}
export { HeadlessBackend as FakeHeadlessBackend };
//# sourceMappingURL=fake-headless-backend.d.ts.map