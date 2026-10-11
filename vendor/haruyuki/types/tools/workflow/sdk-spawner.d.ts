/**
 * SDK-backed subagent execution: one agent() call is one Agent SDK query()
 * in its own agent-free ephemeral conversation, linked to the invoking parent
 * agent. The model is installed when that conversation is created, so
 * concurrent calls with different models never touch a shared agent.
 */
import type { SdkClient, SubagentSpawner } from "./types.ts";
export interface SdkSpawnerConfig {
    /** Invoking agent supplies permissions/resources, never child history ownership. */
    parentAgentId: string;
    /** Default model handle for subagents. */
    model: string;
    /** Resolves a handle or alias from agent() opts; null when unknown. */
    resolveModel?: (identifier: string) => string | null;
    /** Default tool allowlist for subagents. Keep it read-only by default. */
    allowedTools?: string[];
    /** Working directory for subagent sessions. */
    cwd?: string;
    /** Local parent provider settings snapshotted when the workflow starts. */
    parentModelSettings?: Record<string, unknown>;
    /** Local parent context limit snapshotted when the workflow starts. */
    parentContextWindowLimit?: number | null;
    /** Resume is gated on a verified SDK release; 0.8.17 silently creates a new child. */
    supportsAgentFreeResume?: boolean;
    /** Cloud exposes durable Runs; local completion is owned by this spawner. */
    verifyPersistedRuns?: boolean;
    /** Persisted conversation lookup (injected for focused tests). */
    retrieveConversation?: (id: string) => Promise<WorkerConversation>;
    /** Latest persisted conversation run (injected for focused tests). */
    latestRun?: (id: string) => Promise<WorkerRun | null>;
}
export interface WorkerConversation {
    agent_id: string | null;
    parent_agent_id?: string | null;
    model?: string | null;
}
export interface WorkerRun {
    id: string;
    conversation_id?: string | null;
    status?: string;
    completed_at?: string | null;
}
export declare const DEFAULT_ALLOWED_TOOLS: string[];
/**
 * Runaway guards. Live runs showed models re-issuing the identical tool call
 * dozens of times and never ending the turn; every repeat re-sends the whole
 * context. A stopped call resolves to a failed outcome whose error names the
 * guard, so the journal explains the null.
 */
export declare const DEFAULT_SUBAGENT_TIMEOUT_MS: number;
export declare const DEFAULT_MAX_SUBAGENT_TOOL_CALLS = 1000;
export declare const MAX_IDENTICAL_TOOL_CALLS = 3;
/** Parse a JSON reply, tolerating a ``` fence the model added anyway. */
export declare function parseJsonReply(text: string): unknown;
export declare function createSdkSpawner(client: SdkClient, config: SdkSpawnerConfig): SubagentSpawner;
//# sourceMappingURL=sdk-spawner.d.ts.map