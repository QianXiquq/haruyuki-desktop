import type { ApprovalResponseBody } from "../types/protocol_v2";
import type { ChannelControlRequestEvent, ChannelControlResponseInput, ChannelControlResponseResult } from "./types";
export type PendingChannelControlRequest = {
    event: ChannelControlRequestEvent;
    deliveredThisProcess: boolean;
};
export interface ChannelControlRequestInboundInput {
    channel: string;
    accountId?: string;
    chatId: string;
    messageId?: string;
    threadId?: string | null;
    senderId: string;
    text: string;
    bypass?: boolean;
}
export type ChannelControlRequestResponseDeliveryResult = "handled" | "expired" | "unavailable";
export interface ChannelControlRequestCoordinatorOptions {
    deliverPrompt(event: ChannelControlRequestEvent): Promise<void>;
    deliverReprompt(event: ChannelControlRequestEvent, input: ChannelControlRequestInboundInput, message: string): Promise<void>;
    deliverResponse(event: ChannelControlRequestEvent, response: ApprovalResponseBody): Promise<ChannelControlRequestResponseDeliveryResult>;
    persist(event: ChannelControlRequestEvent): Promise<void> | void;
    remove(requestId: string): Promise<void> | void;
}
export declare class ChannelControlRequestCoordinator {
    private readonly options;
    private readonly pendingById;
    private readonly requestIdByScope;
    constructor(options: ChannelControlRequestCoordinatorOptions);
    restore(events: ChannelControlRequestEvent[]): void;
    has(requestId: string): boolean;
    getAll(): PendingChannelControlRequest[];
    register(event: ChannelControlRequestEvent): Promise<void>;
    redeliver(requestId: string): Promise<boolean>;
    handleNativeResponse(input: ChannelControlResponseInput): Promise<ChannelControlResponseResult>;
    tryHandleInbound(input: ChannelControlRequestInboundInput): Promise<boolean>;
    clear(requestId: string): Promise<void>;
    clearAll(): void;
    private remember;
    private deliver;
}
//# sourceMappingURL=control-request-coordinator.d.ts.map