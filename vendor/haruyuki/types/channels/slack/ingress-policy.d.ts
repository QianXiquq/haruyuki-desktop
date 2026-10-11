export interface SlackInboundMessageEventLike {
    channel?: unknown;
    user?: unknown;
    bot_id?: unknown;
    ts?: unknown;
    text?: unknown;
    thread_ts?: unknown;
    subtype?: unknown;
    hidden?: boolean;
    message?: unknown;
}
export interface SlackAppMentionEventLike {
    channel?: unknown;
    user?: unknown;
    bot_id?: unknown;
    ts?: unknown;
    text?: unknown;
    thread_ts?: unknown;
}
export interface SlackReactionEventLike {
    user?: unknown;
    item_user?: unknown;
    reaction?: unknown;
    event_ts?: unknown;
    item?: unknown;
}
export interface ResolveSlackMessageIngressPolicyParams {
    message: SlackInboundMessageEventLike;
    botUserId?: string | null;
    isAgentThread?: boolean;
    appMentionEventWillHandleMentions?: boolean;
}
export interface ResolveSlackAppMentionIngressPolicyParams {
    event: SlackAppMentionEventLike;
    botUserId?: string | null;
}
export interface ResolveSlackReactionIngressPolicyParams {
    event: SlackReactionEventLike;
    action: "added" | "removed";
    botUserId?: string | null;
    mentionOnlyChannels?: readonly string[];
    threadId?: string | null;
}
export interface SlackMessageIngressAccepted {
    shouldRoute: true;
    channelId: string;
    senderId: string;
    senderUserId?: string;
    senderBotId?: string;
    messageId: string;
    threadId: string | null;
    chatType: "direct" | "channel";
    text: string;
    rawText: string;
    wasMentioned: boolean;
    effectiveMention: boolean;
    isAgentThread: boolean;
    routedBy: "mention" | "dm" | "thread";
}
export interface SlackAppMentionIngressAccepted {
    shouldRoute: true;
    channelId: string;
    senderId: string;
    senderUserId?: string;
    senderBotId?: string;
    messageId: string;
    threadId: string;
    chatType: "channel";
    text: string;
    rawText: string;
    wasMentioned: true;
    effectiveMention: true;
    isAgentThread: false;
    routedBy: "mention";
}
export interface SlackReactionIngressAccepted {
    shouldRoute: true;
    channelId: string;
    senderId: string;
    messageId: string;
    threadId: string | null;
    chatType: "direct" | "channel";
    text: string;
    reaction: {
        action: "added" | "removed";
        emoji: string;
        targetMessageId: string;
        targetSenderId?: string;
    };
}
export type SlackIngressIgnoreReason = "missing_channel" | "missing_sender" | "missing_timestamp" | "hidden_message" | "ignored_subtype" | "wrapper_message" | "top_level_channel_message" | "handled_by_app_mention" | "invalid_reaction_item" | "missing_reaction" | "own_bot_reaction" | "mention_only_channel";
export interface SlackIngressIgnored {
    shouldRoute: false;
    reason: SlackIngressIgnoreReason;
}
export type SlackMessageIngressPolicy = SlackMessageIngressAccepted | SlackIngressIgnored;
export type SlackAppMentionIngressPolicy = SlackAppMentionIngressAccepted | SlackIngressIgnored;
export type SlackReactionIngressPolicy = SlackReactionIngressAccepted | SlackIngressIgnored;
export declare function isSlackMentionOnlyChannel(channelId: string, mentionOnlyChannels: readonly string[] | undefined): boolean;
export declare function isProcessableSlackInboundMessage(message: SlackInboundMessageEventLike): boolean;
export declare function shouldSkipSlackMessageByLastSeen(params: {
    lastSeenMessageTs?: string | null;
    messageTs: string;
}): boolean;
export declare function resolveSlackMessageIngressPolicy(params: ResolveSlackMessageIngressPolicyParams): SlackMessageIngressPolicy;
export declare function resolveSlackAppMentionIngressPolicy(params: ResolveSlackAppMentionIngressPolicyParams): SlackAppMentionIngressPolicy;
export declare function resolveSlackReactionIngressPolicy(params: ResolveSlackReactionIngressPolicyParams): SlackReactionIngressPolicy;
//# sourceMappingURL=ingress-policy.d.ts.map