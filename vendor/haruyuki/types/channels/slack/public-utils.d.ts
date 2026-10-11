import type { ChannelTurnSource, OutboundChannelMessage } from "../types";
export declare function isNonEmptyString(value: unknown): value is string;
export declare function firstNonEmptyString(...values: unknown[]): string | undefined;
export declare function resolveSlackChatType(chatId: string): "direct" | "channel";
export declare function resolveSlackSourceThreadTs(source: ChannelTurnSource): string | undefined;
export declare function resolveSlackProgressThreadTs(source: ChannelTurnSource): string | undefined;
export declare function resolveSlackOutboundThreadTs(msg: Pick<OutboundChannelMessage, "chatId" | "threadId" | "replyToMessageId">): string | undefined;
export declare function normalizeSlackReactionName(value: string): string;
export declare function slackTimestampToMillis(value: string): number;
//# sourceMappingURL=public-utils.d.ts.map