import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import { type AppServerClient } from "./app-server-client";
import type { Backend } from "./backend";
import { dequeueConversationMessage, type EnqueueReceipt, enqueueConversationMessage, getLatestConversationSuperRun, listEnqueuedRunMessages } from "./backend/api/conversation-enqueue";
import type { RuntimeExecutionSettings } from "./runtime-execution-settings";
import type { AgentRuntimeScope, ConversationRuntimeScope, LoopState, MessageDelta, RuntimeStartCommand } from "./types/protocol_v2";
import { type ListenerLaunchResult } from "./headless-environment-response";
export declare function listenerControlUrl(baseUrl: string, connectionId: string, scope: ConversationRuntimeScope): string;
/** Cancel only this input: a queued child must not interrupt the turn ahead of it. */
export declare function cancelListenerInput(params: {
    client: AppServerClient;
    scope: AgentRuntimeScope;
    clientMessageId: string;
    dequeue?: typeof dequeueConversationMessage;
    readState: () => {
        loop?: LoopState;
        cancelled: boolean;
    };
}): Promise<boolean>;
/** Reconnect only for explicit cancellation, never to observe task progress. */
export declare function cancelAcceptedListenerInput(receipt: EnqueueReceipt): Promise<boolean>;
/** The CLI remains the caller; the existing listener owns model and tool execution. */
export declare function launchListenerConversation(params: {
    connectionId: string;
    scope: AgentRuntimeScope;
    content: MessageCreate["content"];
    /** Initial assignment identity, not a control-command request_id. */
    clientMessageId?: string;
    backend: Pick<Backend, "retrieveRun">;
    settings: RuntimeExecutionSettings;
    cwd?: string;
    mode: RuntimeStartCommand["mode"];
    skillSources?: RuntimeStartCommand["skill_sources"];
    onMessage?: (message: MessageDelta) => void;
    signal?: AbortSignal;
    /**
     * Return the enqueue receipt as soon as Cloud accepts the send instead of
     * waiting for the remote turn. The caller tracks completion through the
     * Cloud super-run status APIs; nothing in this process keeps waiting.
     */
    noWait?: boolean;
}, deps?: {
    client?: AppServerClient;
    enqueue?: typeof enqueueConversationMessage;
    dequeue?: typeof dequeueConversationMessage;
    latestSuperRun?: typeof getLatestConversationSuperRun;
    listRunMessages?: typeof listEnqueuedRunMessages;
    pollMs?: number;
    waitDeadline?: AbortSignal;
}): Promise<ListenerLaunchResult>;
//# sourceMappingURL=headless-listener-launch.d.ts.map