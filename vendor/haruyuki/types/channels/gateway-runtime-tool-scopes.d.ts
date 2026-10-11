import type { ExternalToolDefinitionPayload, RuntimeExternalToolsUpdateGroup, RuntimeScope, RuntimeStartExternalToolsGroup } from "../types/app-server-protocol";
import type { ChannelGatewayClient, ChannelGatewayToolScopeState } from "./gateway-types";
import type { ChannelTurnSource } from "./types";
export type GatewayToolScope = ChannelGatewayToolScopeState;
export declare class GatewayRuntimeToolScopes {
    private readonly client;
    private readonly states;
    private readonly retryTimers;
    private closed;
    constructor(client: ChannelGatewayClient);
    create(runtime: RuntimeScope, sources: ChannelTurnSource[], automaticRelay: boolean, tool: ExternalToolDefinitionPayload | null): GatewayToolScope;
    retain(scope: GatewayToolScope): void;
    detach(scope: GatewayToolScope): GatewayToolScope;
    release(scope: GatewayToolScope): void;
    resolve(runtime: RuntimeScope<string | null>, scopeId: string): GatewayToolScope | null;
    selection(scope: GatewayToolScope): string[];
    hasRetainedScopes(runtime: RuntimeScope<string | null>): boolean;
    registrationGroups(runtime: RuntimeScope<string | null>, includeUnscoped: boolean): readonly RuntimeStartExternalToolsGroup[];
    setDesiredUnscoped(runtime: RuntimeScope<string | null>, groups: readonly RuntimeStartExternalToolsGroup[]): void;
    updateDesiredUnscoped(updates: readonly RuntimeExternalToolsUpdateGroup[], isBusy: (runtime: RuntimeScope<string | null>) => boolean): Promise<void>;
    flushWhenIdle(runtime: RuntimeScope<string | null>, isBusy: () => boolean, schedule: (task: () => Promise<void>) => Promise<void>): void;
    forgetRuntime(runtime: RuntimeScope<string | null>): void;
    close(): void;
    private getState;
}
//# sourceMappingURL=gateway-runtime-tool-scopes.d.ts.map