/**
 * Shared runtime-command executor for the channel slash commands whose
 * semantics are pure app-server protocol: `/model <handle>`, `/model list`,
 * `/cancel`, `/reflection`, and `/reload`.
 *
 * Every channel host — the local `haruyuki server --channel` gateway and Letta
 * Cloud's Slack gateway — ends up sending the same protocol commands
 * (`update_model`, `list_models`, `abort_message`, `execute_command`) and
 * rendering a reply. Implementing that twice lets the two hosts drift, so the
 * protocol semantics and reply rendering live here once, parameterized by a
 * minimal injected {@link RuntimeCommandClient} that each host backs with its
 * own transport (in-process App Server client locally, the Redis listener
 * relay in Cloud).
 *
 * Like `command-surface.ts`, this module must stay free of host-local
 * dependencies (plugin registry, adapters, settings, websockets) so external
 * hosts can consume it from the public channels entrypoint.
 */
import type { ListModelsResponseModelEntry } from "../types/protocol_v2";
import { type ChannelDisplayNameResolver } from "./command-surface";
/** Runtime identity the protocol commands target. */
export interface RuntimeCommandScope {
    agent_id: string;
    conversation_id: string;
}
/** App-server `execute_command` ids reachable from channel slash commands. */
export type RuntimeExecuteCommandId = "reflect" | "reload";
/** Result of a `list_models` round trip. */
export interface RuntimeCommandListModelsResult {
    success: boolean;
    entries: ListModelsResponseModelEntry[];
    /**
     * Handles available to this user. Tri-state mirrors the wire format:
     * `null` = availability lookup failed; `undefined` = the server did not
     * report availability. Both cases render an explanatory note.
     */
    availableHandles?: string[] | null;
    error?: string;
}
/** Result of an `update_model` round trip. */
export interface RuntimeCommandUpdateModelResult {
    success: boolean;
    /** Canonical handle the server applied (may differ from the request). */
    modelHandle?: string;
    appliedTo?: "agent" | "conversation";
    error?: string;
}
/** Result of an `abort_message` round trip. */
export interface RuntimeCommandAbortResult {
    success: boolean;
    aborted: boolean;
    error?: string;
}
/** Result of an `execute_command` round trip. */
export interface RuntimeCommandExecuteResult {
    success: boolean;
    output: string;
}
/**
 * Minimal transport interface a channel host injects into the executor.
 *
 * Each method corresponds to exactly one app-server protocol command; the
 * host owns request-id generation, correlation, and timeouts. Transport-level
 * failures should be thrown — the executor intentionally does not catch them
 * so each host can apply its own failure copy and logging.
 */
export interface RuntimeCommandClient {
    listModels(): Promise<RuntimeCommandListModelsResult>;
    updateModel(params: {
        runtime: RuntimeCommandScope;
        /** User-provided handle or id; sent as both `model_id` and `model_handle`. */
        modelIdentifier: string;
    }): Promise<RuntimeCommandUpdateModelResult>;
    abortMessage(params: {
        runtime: RuntimeCommandScope;
        runId: string | null;
    }): Promise<RuntimeCommandAbortResult>;
    executeCommand(params: {
        runtime: RuntimeCommandScope;
        commandId: RuntimeExecuteCommandId;
        args?: string;
    }): Promise<RuntimeCommandExecuteResult>;
}
export type ChannelModelListEntry = Pick<ListModelsResponseModelEntry, "id" | "handle" | "label" | "description" | "isDefault" | "isFeatured" | "updateArgs">;
export declare function buildModelEntriesByHandle(entries: ChannelModelListEntry[]): Map<string, ChannelModelListEntry>;
export declare function resolveModelHandles(params: {
    handles: string[];
    byHandle: Map<string, ChannelModelListEntry>;
    availableHandles?: Set<string> | null;
}): ChannelModelListEntry[];
export declare function getFallbackModelEntries(byHandle: Map<string, ChannelModelListEntry>): ChannelModelListEntry[];
export declare function buildChannelModelNotFoundText(channelId: string): string;
export declare function buildChannelCurrentModelMessage(channelId: string, params: {
    modelLabel: string;
    modelHandle: string | null;
    scope?: "agent" | "conversation";
}, displayNameResolver?: ChannelDisplayNameResolver): string;
export declare function buildChannelModelListMessage(channelId: string, params: {
    entries: ListModelsResponseModelEntry[];
    availableHandles?: string[] | null;
    recentHandles?: string[];
    limit?: number;
}, displayNameResolver?: ChannelDisplayNameResolver): string;
export declare function buildChannelModelListUnavailableMessage(channelId: string, error: string, displayNameResolver?: ChannelDisplayNameResolver): string;
export declare function buildChannelCurrentModelUnavailableMessage(channelId: string, error: string, displayNameResolver?: ChannelDisplayNameResolver): string;
export declare function buildChannelModelUpdatedMessage(channelId: string, params: {
    modelLabel: string;
    modelHandle: string;
    appliedTo?: "agent" | "conversation";
}, displayNameResolver?: ChannelDisplayNameResolver): string;
export declare function buildChannelModelUpdateFailedMessage(channelId: string, identifier: string, error: string, displayNameResolver?: ChannelDisplayNameResolver): string;
export declare function buildChannelCancelAcceptedMessage(channelId: string, displayNameResolver?: ChannelDisplayNameResolver): string;
export declare function buildChannelCancelNoActiveTurnMessage(channelId: string, displayNameResolver?: ChannelDisplayNameResolver): string;
/** Rendered reply from a shared runtime-command executor. */
export interface RuntimeCommandReply {
    handled: true;
    text: string;
}
export type ParsedChannelModelCommand = {
    kind: "current";
} | {
    kind: "list";
} | {
    kind: "update";
    modelIdentifier: string;
};
/**
 * Classify `/model` arguments: empty → show the current model (host-owned),
 * `list` (case-insensitive) → list models, anything else → switch to it.
 */
export declare function parseChannelModelCommand(args: string): ParsedChannelModelCommand;
/** `/model list` — send `list_models` and render the selector reply. */
export declare function runChannelModelListCommand(params: {
    channelId: string;
    client: RuntimeCommandClient;
    /** Host-tracked recently used handles (e.g. local settings). */
    recentHandles?: string[];
    channelDisplayName?: ChannelDisplayNameResolver;
}): Promise<RuntimeCommandReply>;
/** `/model <handle-or-id>` — send `update_model` and render the outcome. */
export declare function runChannelModelUpdateCommand(params: {
    channelId: string;
    client: RuntimeCommandClient;
    runtime: RuntimeCommandScope;
    modelIdentifier: string;
    /** Optional handle → human label lookup (e.g. the local model catalog). */
    resolveModelLabel?: (modelHandle: string) => string | undefined;
    channelDisplayName?: ChannelDisplayNameResolver;
}): Promise<RuntimeCommandReply & {
    success: boolean;
    modelHandle?: string;
}>;
/**
 * `/cancel` — send `abort_message` for the routed runtime. `text` is only
 * rendered when `channelId` is provided; hosts that render cancel outcomes
 * themselves (e.g. via `ChannelSlashCommandHandlers` default text) can rely
 * on `cancelled` alone.
 */
export declare function runChannelCancelCommand(params: {
    client: RuntimeCommandClient;
    runtime: RuntimeCommandScope;
    channelId?: string;
    channelDisplayName?: ChannelDisplayNameResolver;
}): Promise<{
    handled: true;
    cancelled: boolean;
    text?: string;
}>;
/** `/reflection` — send `execute_command` (`reflect`) and relay its output. */
export declare function runChannelReflectionCommand(params: {
    client: RuntimeCommandClient;
    runtime: RuntimeCommandScope;
    args?: string;
}): Promise<RuntimeCommandReply>;
/** `/reload` — send `execute_command` (`reload`) and relay its output. */
export declare function runChannelReloadCommand(params: {
    client: RuntimeCommandClient;
    runtime: RuntimeCommandScope;
    args?: string;
}): Promise<RuntimeCommandReply>;
//# sourceMappingURL=command-runtime-executor.d.ts.map