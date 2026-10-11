import type { ChannelTurnLifecycleEvent, ChannelTurnSource, OutboundChannelMessage } from "../types";
export interface SlackStatusWriteClient {
    assistant?: {
        threads?: {
            setStatus?: (args: {
                channel_id: string;
                thread_ts: string;
                status: string;
                loading_messages?: string[];
            }) => Promise<unknown>;
        };
    };
}
export type AgentConvSlackState = {
    isThinkingActive: boolean;
    thinkingText: string;
    typingFooterText: string;
};
export type SlackStatusController = {
    handleLifecycle: (event: ChannelTurnLifecycleEvent) => Promise<void>;
    getUniqueSources: (sources: ChannelTurnSource[]) => ChannelTurnSource[];
    getLifecycleErrorReplyKey: (source: ChannelTurnSource) => string | null;
    activate: (source: ChannelTurnSource, footerText: string, loadingText: string) => Promise<void>;
    deactivate: (source: ChannelTurnSource) => Promise<void>;
    clearStale: (source: ChannelTurnSource) => Promise<void>;
    markAutoCleared: (source: ChannelTurnSource) => void;
    /** Transfer ownership without allowing old writes to clear the new owner. */
    relinquish: (source: ChannelTurnSource) => void;
    markAutoClearedForMessage: (msg: Pick<OutboundChannelMessage, "agentId" | "conversationId" | "chatId" | "threadId" | "replyToMessageId">) => void;
    activeSources: () => ChannelTurnSource[];
    clear: () => void;
};
export declare function createSlackStatusController(params: {
    ensureApp: () => Promise<unknown>;
    ensureWriteClient: () => Promise<SlackStatusWriteClient>;
    resolveKnownThreadRoot: (messageId: string) => string;
}): SlackStatusController;
//# sourceMappingURL=status-controller.d.ts.map