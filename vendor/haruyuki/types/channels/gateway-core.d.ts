import type { ApprovalResponseBody, RuntimeExternalToolsUpdateGroup, RuntimeScope } from "../types/app-server-protocol";
import type { ChannelGatewayActiveTurnState, ChannelGatewayClient, ChannelGatewayDelivery, ChannelGatewayHandoffDelivery, ChannelGatewayHooks, ChannelGatewayModelStatus } from "./gateway-types";
import type { ChannelDefaultPermissionMode, ChannelTurnSource } from "./types";
export type { ChannelGatewayActiveTurnState, ChannelGatewayClient, ChannelGatewayDelivery, ChannelGatewayHandoffDelivery, ChannelGatewayHooks, ChannelGatewayModelStatus, ChannelGatewayRichDraft, } from "./gateway-types";
/**
 * Process-neutral Channels bridge. It only speaks the public App Server
 * protocol; channel adapters and credentials stay behind the injected hooks.
 */
export declare class ChannelGateway {
    private readonly client;
    private readonly hooks;
    private readonly states;
    private readonly disposers;
    private readonly runtimeToolScopes;
    private registrationQueue;
    constructor(client: ChannelGatewayClient, hooks: ChannelGatewayHooks);
    close(): void;
    submit(delivery: ChannelGatewayDelivery): Promise<boolean>;
    private submitDelivery;
    private finishRejectedDelivery;
    adoptQueuedDelivery(delivery: ChannelGatewayHandoffDelivery): void;
    restoreRuntime(runtime: RuntimeScope, sources: ChannelTurnSource[]): Promise<Set<string>>;
    adoptActiveDelivery(delivery: ChannelGatewayHandoffDelivery): Promise<void>;
    releaseActiveDelivery(runtime: RuntimeScope, clientMessageId: string): ChannelGatewayActiveTurnState | null;
    registerRuntime(runtime: RuntimeScope, sources?: ChannelTurnSource[], defaultPermissionMode?: ChannelDefaultPermissionMode): Promise<void>;
    publishRuntimeTools(runtime: RuntimeScope, sources?: ChannelTurnSource[]): Promise<boolean>;
    releaseRuntimeTools(runtime: RuntimeScope, routedSources?: ChannelTurnSource[], options?: {
        cleanupIdleRuntime?: boolean;
    }): Promise<void>;
    submitApprovalResponse(runtime: RuntimeScope, response: ApprovalResponseBody): Promise<boolean>;
    setRoutedSources(runtime: RuntimeScope, sources: ChannelTurnSource[]): void;
    getKnownRuntimes(): RuntimeScope[];
    updateRoutedRuntimeTools(updates: readonly RuntimeExternalToolsUpdateGroup[], routedSources: Array<{
        runtime: RuntimeScope;
        sources: ChannelTurnSource[];
    }>): Promise<void>;
    getModelStatus(runtime: RuntimeScope): ChannelGatewayModelStatus | null;
    updateModelStatus(runtime: RuntimeScope, modelHandle: string | null): void;
    private getState;
    private finishToolScopesIfIdle;
    private enqueueHook;
    private enqueueRegistration;
    private performRuntimeRegistration;
    private handleMessage;
    private handleQueueUpdate;
    private reconcileExplicitQueueRemovals;
    private activateSources;
    private handleStreamDelta;
    private enqueueFinalizedAssistantMessages;
    private handleTurnFinished;
    private handleControlRequest;
}
//# sourceMappingURL=gateway-core.d.ts.map