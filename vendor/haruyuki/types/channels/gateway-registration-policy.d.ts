import type { RuntimeScope, RuntimeStartResponseMessage } from "../types/app-server-protocol";
import type { ChannelGatewayHooks, ChannelGatewayModelStatus } from "./gateway-types";
import type { ChannelTurnSource } from "./types";
export declare function prepareGatewayRegistrationPolicy(options: {
    hooks: ChannelGatewayHooks;
    runtime: RuntimeScope;
    sources: ChannelTurnSource[];
    override?: boolean;
}): Promise<{
    automaticRelay: boolean;
    tool: Awaited<ReturnType<ChannelGatewayHooks["buildExternalTool"]>>;
}>;
export declare function modelStatusFromRuntimeStart(response: RuntimeStartResponseMessage, runtime: RuntimeScope): ChannelGatewayModelStatus;
//# sourceMappingURL=gateway-registration-policy.d.ts.map