import type { StopReasonType, StreamDeltaMessage } from "../types/app-server-protocol";
import type { MessageChannelIdempotencyScope } from "./message-channel-idempotency";
import type { ChannelTurnSource } from "./types";
export interface GatewayAssistantTextAccumulatorState {
    currentMessageId: string | null;
    currentText: string;
    deltaKeys: string[];
    finalizedMessageIds: string[];
}
export interface FinalizedGatewayAssistantMessage {
    messageId: string;
    text: string;
}
export declare class GatewayAssistantTextAccumulator {
    private currentMessageId;
    private currentText;
    private readonly deltaKeys;
    private readonly finalizedMessageIds;
    constructor(state?: GatewayAssistantTextAccumulatorState);
    snapshot(): GatewayAssistantTextAccumulatorState;
    handleDelta(message: StreamDeltaMessage): FinalizedGatewayAssistantMessage[];
    finalizeCurrent(): FinalizedGatewayAssistantMessage | null;
}
export declare function relayFinalizedAssistantMessage(options: {
    message: FinalizedGatewayAssistantMessage;
    sources: ChannelTurnSource[];
    idempotencyScope: MessageChannelIdempotencyScope;
    relay?: (options: {
        text: string;
        sources: ChannelTurnSource[];
        idempotencyScope: MessageChannelIdempotencyScope;
    }) => void | Promise<void>;
}): void | Promise<void>;
export declare function stopReasonFromDelta(message: StreamDeltaMessage): StopReasonType | null;
export declare function runIdFromDelta(message: StreamDeltaMessage): string | undefined;
export declare function channelTurnOutcome(stopReason: StopReasonType): "completed" | "error" | "cancelled";
//# sourceMappingURL=gateway-assistant-relay.d.ts.map