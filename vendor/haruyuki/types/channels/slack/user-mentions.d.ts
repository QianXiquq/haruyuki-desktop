import type { InboundChannelMessage } from "../types";
type ResolveSlackUserName = (userId: string) => Promise<string | undefined>;
export declare function stripSlackBotMention(text: string, botUserId: string | null | undefined): string;
export declare function sanitizeSlackUserDisplayName(value: string | undefined, fallbackUserId: string): string;
export declare function resolveSlackUserMentionsInMessage(params: {
    message: InboundChannelMessage;
    resolveUserName: ResolveSlackUserName;
}): Promise<InboundChannelMessage>;
export {};
//# sourceMappingURL=user-mentions.d.ts.map