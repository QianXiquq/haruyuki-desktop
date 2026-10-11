import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { StopReasonType } from "@letta-ai/letta-client/resources/runs/runs";
import type { Backend } from "./backend";
import { type AgentRuntimeStatusSnapshot } from "./backend/api/agents";
import type { EnqueueReceipt } from "./backend/api/conversation-enqueue";
import { type EnvironmentConnection, type SendEnvironmentMessageBody } from "./backend/api/environments";
import type { ResultMessage, UsageStatistics } from "./types/protocol";
export type ListenerLaunchResult = {
    status: "completed";
    text: string;
    stopReason: StopReasonType | null;
    runIds: string[];
    usage: UsageStatistics;
} | {
    status: "queued";
    receipt: EnqueueReceipt;
};
export type ReplyEnvironmentMetadata = {
    source: "same-environment";
} | {
    source: "explicit" | "cloud-sandbox";
    input: string;
    id: string;
    connection_id: string;
    device_id: string;
    name: string;
};
export declare function buildEnvironmentResponseMetadata(params: {
    source: Extract<ReplyEnvironmentMetadata, {
        source: "explicit" | "cloud-sandbox";
    }>["source"];
    input: string;
    connectionId: string;
    environment: EnvironmentConnection;
}): ReplyEnvironmentMetadata;
/** One wire envelope for accepted, completed, and failed listener launches. */
export declare function buildEnvironmentLaunchResult(base: {
    sessionId: string;
    agentId: string | null;
    internalAgentId: string;
    conversationId: string;
    environment: ReplyEnvironmentMetadata;
    durationMs: number;
    durationApiMs: number;
}, outcome: ListenerLaunchResult | {
    status: "error";
    error: string;
}): ResultMessage & {
    is_error: boolean;
    environment: ReplyEnvironmentMetadata;
};
export declare function isCloudEnvironmentSelector(selector: string | boolean | undefined): boolean;
export declare function getEnvironmentRoutedMessagingUnsupportedReason(environment: EnvironmentConnection): string | null;
/**
 * Build the POST body for an environment-routed turn.
 *
 * Includes the local client-tool restriction (the `--tools` flag, stored in
 * toolFilter) as `client_tool_allowlist` so the remote listener enforces the
 * same toolset the local turn would have used. `null` (no filter) omits the
 * field and preserves the listener's normal toolset; an empty list travels as
 * an empty array, which the listener treats as "no client tools". Older cloud
 * servers strip the field, which degrades to the previous behavior (the
 * listener's own toolset) rather than failing.
 */
export declare function buildEnvironmentCreateMessageBody(params: {
    agentId: string;
    conversationId: string | null;
    content: MessageCreate["content"];
    otid: string;
}): SendEnvironmentMessageBody;
/**
 * Ceiling for waiting on an environment-routed turn. Overridable with
 * HARUYUKI_ENVIRONMENT_TIMEOUT_MS (milliseconds); defaults to one hour.
 */
export declare function resolveEnvironmentMaxWaitMs(): number;
/**
 * Wait for the assistant reply of an environment-routed turn.
 *
 * The remote turn runs on another machine; this poller only observes the
 * conversation through the API. The primary liveness signal is the server's
 * per-conversation runtime-status record (GET
 * /v1/agents/:agentId/runtime-status): a non-IDLE state is progress, and the
 * turn is over when the record goes IDLE or the owning listener reports
 * WAITING_ON_INPUT. When the route 404s (older server or the feed kill
 * switch), the wait falls back to inferring liveness from the turn's runs.
 * Either way it keeps waiting while there is evidence the turn is alive and
 * fails when:
 *
 * - the device goes offline (checked every `onlineCheckIntervalMs` when
 *   `deviceId` is provided);
 * - the turn ends (record IDLE / run terminal) without an assistant reply;
 * - nothing observable happens for `inactivityTimeoutMs`; or
 * - the absolute ceiling `maxWaitMs` is hit (default one hour, overridable
 *   with HARUYUKI_ENVIRONMENT_TIMEOUT_MS).
 */
export declare function waitForEnvironmentAssistantMessage(params: {
    backend: Backend;
    agentId: string;
    conversationId: string;
    otid: string;
    /** Device to liveness-check while waiting. Omitting skips online checks. */
    deviceId?: string;
    maxWaitMs?: number;
    inactivityTimeoutMs?: number;
    pollIntervalMs?: number;
    onlineCheckIntervalMs?: number;
    runStatusIntervalMs?: number;
    /** Injectable for deterministic tests. */
    deps?: {
        now?: () => number;
        sleep?: (ms: number) => Promise<void>;
        getEnvironmentConnection?: (deviceId: string) => Promise<EnvironmentConnection>;
        getAgentRuntimeStatus?: (agentId: string, conversationIds: string[]) => Promise<AgentRuntimeStatusSnapshot>;
    };
}): Promise<{
    text: string;
    stopReason: StopReasonType | null;
}>;
//# sourceMappingURL=headless-environment-response.d.ts.map