export interface ForkConversationOptions {
    agentId?: string;
    hidden?: boolean;
    messageId?: string;
    /** Extra headers forwarded on the request. */
    headers?: Record<string, string>;
    signal?: AbortSignal;
}
export type ConversationDescriptionUpdateBody = Record<string, unknown> & {
    description: string | null;
};
export type SummarizeConversationBody = Record<string, unknown> & {
    prompt: string;
    messages: Array<{
        role: "user" | "assistant" | "system";
        content: string;
    }>;
    model?: string;
};
export declare function forkConversation(conversationId: string, options?: ForkConversationOptions): Promise<{
    id: string;
}>;
export declare function updateConversationDescription(conversationId: string, body: ConversationDescriptionUpdateBody): Promise<Record<string, unknown>>;
export declare function summarizeConversation(conversationId: string, body: SummarizeConversationBody, options?: {
    signal?: AbortSignal;
}): Promise<{
    summary: string;
}>;
//# sourceMappingURL=conversations.d.ts.map