import type { RuntimeStartExternalToolsGroup } from "../types/app-server-protocol";
import type { GatewayRuntimeState } from "./gateway-runtime-state";
import type { ChannelGatewayClient, ChannelGatewayDelivery, ChannelGatewayHooks } from "./gateway-types";
export declare function performGatewayRuntimeRegistration(options: {
    client: ChannelGatewayClient;
    hooks: ChannelGatewayHooks;
    state: GatewayRuntimeState;
    delivery: ChannelGatewayDelivery;
    policyOverride?: boolean;
    externalToolsOverride?: readonly RuntimeStartExternalToolsGroup[];
}): Promise<boolean>;
//# sourceMappingURL=gateway-runtime-registration.d.ts.map