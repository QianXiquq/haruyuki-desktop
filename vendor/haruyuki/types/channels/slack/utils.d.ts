import type { ChannelTurnSource } from "../types";
import type { SlackAppConstructor, SlackBlock, SlackBoltModule } from "./internal-types";
export declare function resolveSlackAppConstructor(mod: SlackBoltModule): SlackAppConstructor;
export declare function isNonEmptyString(value: unknown): value is string;
export declare function firstNonEmptyString(...values: unknown[]): string | undefined;
export declare function asRecord(value: unknown): Record<string, unknown> | null;
export declare function resolveSlackSenderTeamId(value: unknown): string | undefined;
export type SlackProcessableInboundMessage = Record<string, unknown> & {
    user?: string;
    bot_id?: string;
    ts: string;
};
export declare function isProcessableSlackInboundMessage(rawMessage: Record<string, unknown>): rawMessage is SlackProcessableInboundMessage;
export declare function slackTimestampToMillis(timestamp: string): number;
export declare function resolveSlackChatType(chatId: string): "direct" | "channel";
export declare function resolveSlackOutboundThreadTs(params: {
    chatId: string;
    threadId?: string | null;
    replyToMessageId?: string | null;
}): string | undefined;
export declare function asSlackBlocks(blocks: unknown[] | undefined): SlackBlock[] | undefined;
export declare function getSlackActionRecord(action: unknown, body: unknown): Record<string, unknown> | null;
export declare function resolveSlackActionChannelId(body: unknown): string | null;
export declare function resolveSlackActionThreadId(body: unknown): string | null;
export declare function resolveSlackActionMessageId(body: unknown): string | undefined;
export declare function resolveSlackActionUser(body: unknown): {
    id: string | null;
    name?: string;
    teamId?: string;
};
export declare function resolveSlackSourceThreadTs(source: ChannelTurnSource): string | undefined;
export declare function resolveSlackProgressThreadTs(source: ChannelTurnSource): string | undefined;
export declare function normalizeSlackReactionName(value: string): string;
export declare function resolveSlackUserDisplayName(userInfo: unknown): string | undefined;
export declare function hasSlackMention(text: string, userId: string | null): boolean;
export declare function isSlackFlatChannelThreadOpener(source: ChannelTurnSource): boolean;
//# sourceMappingURL=utils.d.ts.map