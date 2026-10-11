import type { ConversationRuntime, ListenerRuntime } from "./types";
export declare function ensureConversationQueueRuntime(listener: ListenerRuntime, runtime: ConversationRuntime): ConversationRuntime;
export declare function getOrCreateScopedRuntime(listener: ListenerRuntime, agentId?: string | null, conversationId?: string | null): ConversationRuntime;
//# sourceMappingURL=conversation-runtime.d.ts.map