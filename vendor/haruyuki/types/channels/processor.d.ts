import type { ChannelRoute, ChannelTurnSource, InboundChannelMessage, OutboundChannelMessage } from "./types";
export interface BuildChannelTurnSourceParams {
    message: InboundChannelMessage;
    route: ChannelRoute;
}
export interface FormatInboundChannelMessageParams {
    message: InboundChannelMessage;
}
export interface ChannelBatchMessage {
    text: string;
    senderId?: string;
    senderName?: string;
    timestamp?: string | number;
    channelTurnSource?: ChannelTurnSource;
}
export interface FormatBatchedChannelMessagesParams {
    messages: ChannelBatchMessage[];
}
export interface BuildOutboundChannelMessageFromTurnSourceParams {
    turnSource: ChannelTurnSource;
    text: string;
}
export declare function buildChannelTurnSource(params: BuildChannelTurnSourceParams): ChannelTurnSource;
export declare function formatInboundChannelMessageForAgent(params: FormatInboundChannelMessageParams): string;
export declare function formatBatchedChannelMessagesForAgent(params: FormatBatchedChannelMessagesParams): string;
export declare function buildOutboundChannelMessageFromTurnSource(params: BuildOutboundChannelMessageFromTurnSourceParams): OutboundChannelMessage;
//# sourceMappingURL=processor.d.ts.map