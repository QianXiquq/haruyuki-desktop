import type { RuntimeScope } from "../types/app-server-protocol";
import type { GatewayAssistantTextAccumulator } from "./gateway-assistant-relay";
import type { GatewayToolScope } from "./gateway-runtime-tool-scopes";
import type { ChannelGatewayModelStatus, ChannelGatewayRichDraft } from "./gateway-types";
import type { MessageChannelIdempotencyScope } from "./message-channel-idempotency";
import type { createChannelTurnProgressBuilder } from "./progress-builder";
import type { ChannelTurnSource } from "./types";
export type ActiveGatewayTurn = {
    batchId: string;
    routingSources: ChannelTurnSource[];
    lifecycleSources: ChannelTurnSource[];
    progress: ReturnType<typeof createChannelTurnProgressBuilder>;
    richDraft: ChannelGatewayRichDraft | null;
    runId?: string;
    assistantText: GatewayAssistantTextAccumulator;
    idempotencyScope: MessageChannelIdempotencyScope;
    relayEligible: boolean;
    toolScopes: GatewayToolScope[];
};
export type GatewayRuntimeState = {
    runtime: RuntimeScope;
    pendingSourcesByClientMessageId: Map<string, {
        sources: ChannelTurnSource[];
        disposition: "submitting" | "queued";
        automaticRelay: boolean;
        toolScope?: GatewayToolScope;
        removalDisposition?: "dequeued" | "cancelled";
    }>;
    active: ActiveGatewayTurn | null;
    registrationSignature: string | null;
    registration: Promise<void> | null;
    routedSources: ChannelTurnSource[];
    replayedControlRequestIds: Set<string>;
    submissionQueue: Promise<void>;
    hookQueue: Promise<void> | null;
    acceptedClientMessageIds: Set<string>;
    modelStatus: ChannelGatewayModelStatus | null;
};
export declare function gatewayRuntimeKey(runtime: RuntimeScope<string | null>): string;
export declare function hasAgentRuntime<T extends {
    runtime?: RuntimeScope<string | null> | null;
}>(value: T): value is T & {
    runtime: RuntimeScope;
};
export declare function hasGatewayRuntimeWork(state: GatewayRuntimeState | undefined): boolean;
export declare function rememberAcceptedClientMessageId(state: GatewayRuntimeState, clientMessageId: string): void;
export declare function remainingGatewaySources(state: GatewayRuntimeState): ChannelTurnSource[];
//# sourceMappingURL=gateway-runtime-state.d.ts.map