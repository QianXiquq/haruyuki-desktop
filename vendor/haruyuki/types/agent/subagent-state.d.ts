/**
 * Subagent state management for tracking active subagents
 *
 * This module provides a centralized state store that bridges non-React code
 * (manager.ts) with React components (SubagentGroupDisplay.tsx).
 * Uses an event-emitter pattern compatible with React's useSyncExternalStore.
 */
export interface ToolCall {
    id: string;
    name: string;
    args: string;
}
export interface SubagentState {
    id: string;
    type: string;
    description: string;
    prompt?: string;
    status: "pending" | "running" | "completed" | "error";
    agentId?: string | null;
    agentURL: string | null;
    conversationId?: string | null;
    /** Exact accepted Super Run for a remotely executing child send. */
    superRunId?: string;
    toolCalls: ToolCall[];
    maxToolCallsSeen: number;
    totalTokens: number;
    durationMs: number;
    error?: string;
    model?: string;
    startTime: number;
    toolCallId?: string;
    isBackground?: boolean;
    /** False when the entry is presentation-only and must not retain the parent runtime. */
    claimsParentRuntime?: boolean;
    silent?: boolean;
    parentAgentId?: string;
    parentConversationId?: string;
}
export type SubagentLifecycleStatus = SubagentState["status"];
export interface SubagentLifecycleItem {
    id: string;
    type: string;
    description: string;
    status: SubagentLifecycleStatus;
    agentId: string | null;
    agentUrl: string | null;
    startedAtMs: number;
    elapsedMs: number;
    isBackground: boolean;
    visibleInTranscript: boolean;
}
export interface SubagentLifecycleContext {
    list(): SubagentLifecycleItem[];
}
/**
 * Generate a unique subagent ID
 */
export declare function generateSubagentId(): string;
/**
 * Get a subagent by its parent Task tool call ID
 */
export declare function getSubagentByToolCallId(toolCallId: string): SubagentState | undefined;
/**
 * Register a new subagent when Task tool starts
 */
export declare function registerSubagent(id: string, type: string, description: string, toolCallId?: string, isBackground?: boolean, silent?: boolean, parentScope?: {
    agentId?: string | null;
    conversationId?: string | null;
}, prompt?: string, claimsParentRuntime?: boolean): void;
/**
 * Update a subagent's state
 */
export declare function updateSubagent(id: string, updates: Partial<Omit<SubagentState, "id">>): void;
/**
 * Add a tool call to a subagent
 */
export declare function addToolCall(subagentId: string, toolCallId: string, toolName: string, toolArgs: string): void;
/**
 * Mark a subagent as completed
 */
export declare function completeSubagent(id: string, result: {
    success: boolean;
    error?: string;
    totalTokens?: number;
}): void;
export declare function __setCompletedSubagentRetentionMsForTests(ms: number): void;
export declare function __resetCompletedSubagentRetentionMsForTests(): void;
export declare function getSubagentToolCount(agent: Pick<SubagentState, "toolCalls" | "maxToolCallsSeen">): number;
/**
 * Toggle expanded/collapsed state
 */
export declare function toggleExpanded(): void;
/**
 * Get current expanded state
 */
export declare function isExpanded(): boolean;
/**
 * Get all active subagents (not yet cleared)
 */
export declare function getSubagents(): SubagentState[];
/**
 * Get silent background agents that are still pending or running
 */
export declare function getActiveBackgroundAgents(): SubagentState[];
export declare function getSubagentLifecycleItems(): SubagentLifecycleItem[];
export declare function getSubagentLifecycleSnapshot(): SubagentLifecycleItem[];
export declare function getSubagentLifecycleContext(): SubagentLifecycleContext;
export declare function subscribeToSubagentLifecycle(listener: () => void): () => void;
/**
 * Get subagents grouped by type
 */
export declare function getGroupedSubagents(): Map<string, SubagentState[]>;
/**
 * Clear all completed subagents (call on new user message)
 */
export declare function clearCompletedSubagents(): void;
/**
 * Clear specific subagents by their IDs (call when committing to staticItems)
 */
export declare function clearSubagentsByIds(ids: string[]): void;
/**
 * Clear all subagents
 */
export declare function clearAllSubagents(): void;
/**
 * Check if there are any active subagents
 */
export declare function hasActiveSubagents(): boolean;
/**
 * Mark all running/pending subagents as interrupted
 * Called when user presses ESC to interrupt execution
 */
export declare function interruptActiveSubagents(errorMessage: string): void;
/**
 * Subscribe to store changes
 */
export declare function subscribe(listener: () => void): () => void;
/**
 * Get a snapshot of the current state for React
 * Returns cached snapshot - only updates when notifyListeners is called
 */
export declare function getSnapshot(): {
    agents: SubagentState[];
    expanded: boolean;
};
/** Worker output or a harness notification after its memory push completes. */
export type SubagentStreamEvent = {
    type: "message";
    message_type: string;
    [key: string]: unknown;
} | {
    type: "memory_updated";
    affected_paths: string[];
    timestamp: number;
};
/**
 * Callback for forwarding raw subagent stream events to the WS layer.
 * Events include streamed output and harness-owned memory push notifications.
 */
export type SubagentStreamEventListener = (subagentId: string, event: SubagentStreamEvent) => void;
/**
 * Subscribe to raw subagent stream events (for WS forwarding).
 * Returns an unsubscribe function.
 */
export declare function subscribeToStreamEvents(listener: SubagentStreamEventListener): () => void;
/**
 * Emit a raw stream event from a subagent. Called from processStreamEvent
 * in manager.ts for message-type events that should be forwarded to the web UI.
 */
export declare function emitStreamEvent(subagentId: string, event: SubagentStreamEvent): void;
//# sourceMappingURL=subagent-state.d.ts.map