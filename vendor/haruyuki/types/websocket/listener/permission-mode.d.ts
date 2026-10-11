/**
 * Per-conversation permission mode storage.
 *
 * Mirrors the CWD isolation pattern in cwd.ts:
 * - State is stored in a Map on the long-lived ListenerRuntime (not on the
 *   ephemeral ConversationRuntime, which gets evicted between turns).
 * - A scope key derived from agentId + conversationId is used as the map key.
 */
import { type PermissionMode } from "../../permissions/mode";
import type { ListenerRuntime } from "./types";
export type ConversationPermissionModeState = {
    mode: PermissionMode;
};
export declare function getPermissionModeScopeKey(agentId?: string | null, conversationId?: string | null): string;
/**
 * Read-only state lookup for a conversation scope.
 *
 * This helper is intended for read paths (status rendering, serialization).
 * It does not materialize new map entries for missing scopes.
 */
export declare function getConversationPermissionModeState(runtime: ListenerRuntime, agentId?: string | null, conversationId?: string | null): Readonly<ConversationPermissionModeState>;
/**
 * Returns the canonical mutable state object for a conversation scope.
 *
 * This helper materializes missing entries and guarantees stable identity
 * during a turn so concurrent mode updates (websocket + tool mutations)
 * apply to the same object reference.
 */
export declare function getOrCreateConversationPermissionModeStateRef(runtime: ListenerRuntime, agentId?: string | null, conversationId?: string | null): ConversationPermissionModeState;
/**
 * Remove a canonical state entry when it is equivalent to the default state.
 *
 * This should be called at turn finalization boundaries, not on each mode
 * update, to avoid breaking object identity for in-flight turns.
 */
export declare function pruneConversationPermissionModeStateIfDefault(runtime: ListenerRuntime, agentId?: string | null, conversationId?: string | null): boolean;
/**
 * Load the persisted permission mode map from remote-settings.json.
 * Converts PersistedPermissionModeState → ConversationPermissionModeState.
 */
export declare function loadPersistedPermissionModeMap(): Map<string, ConversationPermissionModeState>;
/**
 * Persist permission mode map to remote-settings.json.
 */
export declare function persistPermissionModeMapForRuntime(runtime: ListenerRuntime): void;
//# sourceMappingURL=permission-mode.d.ts.map