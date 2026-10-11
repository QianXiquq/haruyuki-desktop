export interface EphemeralConversationCreateBody {
    [key: string]: unknown;
    model: string;
    system: string;
    model_settings?: Record<string, unknown>;
    context_window_limit?: number | null;
}
export interface EphemeralConversation {
    id: string;
    agent_id: null;
    model: string;
    context_window_limit: number | null;
}
export declare function createEphemeralConversation(body: EphemeralConversationCreateBody): Promise<EphemeralConversation>;
//# sourceMappingURL=ephemeral-conversations.d.ts.map