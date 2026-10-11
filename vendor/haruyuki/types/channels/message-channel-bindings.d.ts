/** Persisted inbound routing state, supplied by the host that owns the route. */
export interface ChannelConversationBinding {
    conversationId: string;
    enabled: boolean;
    outboundEnabled: boolean;
    detached: boolean;
}
export interface ChannelBindingSelection {
    channel: string;
    accountId?: string;
    chatId: string;
    threadId: string | null;
}
export interface ChannelBindingLookup extends ChannelBindingSelection {
    accountId: string;
    binding: ChannelConversationBinding | null;
}
export interface ChannelBindingUpdate extends ChannelBindingLookup {
    status: "updated" | "unchanged" | "conflict" | "not-found";
    previousConversationId: string | null;
}
export interface MessageChannelBindingOperations {
    get(selection: ChannelBindingSelection, scope: {
        agentId: string;
        conversationId: string;
    }): Promise<ChannelBindingLookup>;
    update(selection: ChannelBindingSelection & {
        conversationId: string;
        expectedConversationId: string;
    }, scope: {
        agentId: string;
        conversationId: string;
    }): Promise<ChannelBindingUpdate>;
}
export type ChannelSendBindingInfo = ChannelBindingLookup | {
    unavailable: true;
};
export declare function formatSlackBindingNotice(info: ChannelSendBindingInfo | undefined, conversationId: string): string;
//# sourceMappingURL=message-channel-bindings.d.ts.map