import type { Stream } from "@letta-ai/letta-client/core/streaming";
import type { LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
import type { ConversationMessageCreateBody, ConversationMessageStreamBody } from "../backend";
import type { LocalMessage } from "../local/local-message";
import type { LocalAgentRecord, StoredMessage } from "../local/local-store";
export type HeadlessTurnBody = ConversationMessageCreateBody | ConversationMessageStreamBody;
export interface HeadlessTurnExecutorInput {
    conversationId: string;
    agentId: string;
    agent: LocalAgentRecord;
    systemPrompt?: string;
    body: HeadlessTurnBody;
    history: StoredMessage[];
    uiMessages: LocalMessage[];
    /**
     * Frozen tool declaration set. When present the executor must use it instead
     * of the live `client_tools` in the body (prefix freeze; see prefix-freeze.ts).
     */
    clientTools?: unknown[];
}
export interface HeadlessTurnExecutor {
    execute(input: HeadlessTurnExecutorInput): Promise<Stream<LettaStreamingResponse>>;
}
export declare function createAssistantMessageStream(message?: Partial<Pick<StoredMessage, "id" | "date" | "content">>): Stream<LettaStreamingResponse>;
export declare class DeterministicPongExecutor implements HeadlessTurnExecutor {
    execute(_input: HeadlessTurnExecutorInput): Promise<Stream<LettaStreamingResponse>>;
}
/**
 * Deterministic test executor that keeps ordinary turns simple while making a
 * reflection prove it opened the transcript before returning success.
 */
export declare class DeterministicReflectionExecutor implements HeadlessTurnExecutor {
    private toolCallSeq;
    execute(input: HeadlessTurnExecutorInput): Promise<Stream<LettaStreamingResponse>>;
}
export declare class DeterministicToolCallExecutor implements HeadlessTurnExecutor {
    private toolCallSeq;
    execute(input: HeadlessTurnExecutorInput): Promise<Stream<LettaStreamingResponse>>;
}
//# sourceMappingURL=headless-turn-executor.d.ts.map