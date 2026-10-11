import type { RuntimeScope } from "../../types/protocol_v2";
import type { ListenerRuntime } from "./types";
export declare function normalizeCwdAgentId(agentId?: string | null): string | null;
export declare function normalizeConversationId(conversationId?: string | null): string;
export declare function resolveScopedAgentId(runtime: ListenerRuntime | null, params?: {
    agent_id?: string | null;
}): string | null;
export declare function resolveScopedConversationId(runtime: ListenerRuntime | null, params?: {
    conversation_id?: string | null;
}): string;
export declare function resolveRuntimeScope(runtime: ListenerRuntime | null, params?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): RuntimeScope<string | null> | null;
//# sourceMappingURL=scope.d.ts.map