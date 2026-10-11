import type { PendingControlRequest } from "../../types/protocol_v2";
import type { ConversationRuntime, ListenerRuntime, RecoveredApprovalState, StartListenerOptions } from "./types";
export declare function getActiveRuntime(): ListenerRuntime | null;
export declare function setActiveRuntime(runtime: ListenerRuntime | null): void;
export declare function safeEmitWsEvent(direction: "send" | "recv", label: "client" | "protocol" | "control" | "lifecycle", event: unknown): void;
export declare function nextEventSeq(runtime: ListenerRuntime | null): number | null;
export declare function clearRuntimeTimers(runtime: ListenerRuntime): void;
/**
 * How long an evicted conversation's worktree watcher may stay alive waiting
 * for the conversation to come back. Runtime eviction is routine (it fires
 * after every quiescent turn), and the watcher's job is to track worktree
 * changes for an attached client *between* turns — so it must survive
 * eviction, but not for the life of the process. Without this, one live
 * fs.watch loop accumulates per conversation ever touched (LET-10138).
 */
export declare const WORKTREE_WATCHER_IDLE_STOP_MS: number;
export declare const __watcherIdleStopTestUtils: {
    /** Fire every pending idle stop immediately (tests cannot wait 30 minutes). */
    firePending(listener: ListenerRuntime): void;
    hasPending(listener: ListenerRuntime, scopeKey: string): boolean;
};
export declare function evictConversationRuntimeIfIdle(runtime: ConversationRuntime): boolean;
export declare function getListenerStatus(listener: ListenerRuntime): "idle" | "receiving" | "processing";
export declare function emitListenerStatus(listener: ListenerRuntime, onStatusChange: StartListenerOptions["onStatusChange"] | undefined, connectionId: string | undefined): void;
export declare function getConversationRuntimeKey(agentId?: string | null, conversationId?: string | null): string;
export declare function createConversationRuntime(listener: ListenerRuntime, agentId?: string | null, conversationId?: string | null): ConversationRuntime;
export declare function getConversationRuntime(listener: ListenerRuntime, agentId?: string | null, conversationId?: string | null): ConversationRuntime | null;
export declare function getOrCreateConversationRuntime(listener: ListenerRuntime, agentId?: string | null, conversationId?: string | null): ConversationRuntime;
export declare function clearRecoveredApprovalState(runtime: ConversationRuntime): void;
export declare function invalidateExternalToolNotifications(runtime: ConversationRuntime): void;
export declare function beginExternalToolNotificationReset(runtime: ConversationRuntime): () => void;
export declare function clearConversationRuntimeState(runtime: ConversationRuntime): void;
export declare function getRecoveredApprovalStateForScope(runtime: ListenerRuntime, params?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): RecoveredApprovalState | null;
export declare function clearRecoveredApprovalStateForScope(runtime: ListenerRuntime, params?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): void;
export declare function getPendingControlRequests(runtime: ListenerRuntime, params?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): PendingControlRequest[];
export declare function hasInterruptedCacheForScope(runtime: ListenerRuntime, params?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): boolean;
export declare function getPendingControlRequestCount(runtime: ListenerRuntime, params?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): number;
//# sourceMappingURL=runtime.d.ts.map