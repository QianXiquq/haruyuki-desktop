import type { OutboundChannelMessage } from "../types";
export interface SlackSenderPostMessageParams {
    channel: string;
    text: string;
    threadTs?: string;
    blocks?: unknown[];
}
export interface SlackSenderPostMessageResult {
    messageId: string;
}
export interface SlackSenderMessageResult {
    messageId: string;
}
export interface SlackSenderReactionParams {
    channel: string;
    timestamp: string;
    name: string;
}
export interface SlackSenderClient {
    postMessage(params: SlackSenderPostMessageParams): Promise<SlackSenderPostMessageResult>;
    addReaction?(params: SlackSenderReactionParams): Promise<void>;
    removeReaction?(params: SlackSenderReactionParams): Promise<void>;
}
export interface SlackChannelSender {
    sendMessage(message: OutboundChannelMessage): Promise<SlackSenderMessageResult>;
    sendDirectReply(params: SlackDirectReplyParams): Promise<void>;
}
export interface SlackDirectReplyParams {
    chatId: string;
    text: string;
    replyToMessageId?: string;
    threadId?: string | null;
    blocks?: unknown[];
}
export interface CreateSlackChannelSenderParams {
    client: SlackSenderClient;
}
export declare function createSlackChannelSender(params: CreateSlackChannelSenderParams): SlackChannelSender;
//# sourceMappingURL=sender.d.ts.map