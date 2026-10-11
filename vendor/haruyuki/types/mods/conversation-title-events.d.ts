export interface ConversationTitleChange {
    conversationId: string;
    title: string;
}
type ConversationTitleChangeListener = (change: ConversationTitleChange) => void;
export declare function publishConversationTitleChange(change: ConversationTitleChange): void;
export declare function subscribeToConversationTitleChanges(listener: ConversationTitleChangeListener): () => void;
export {};
//# sourceMappingURL=conversation-title-events.d.ts.map