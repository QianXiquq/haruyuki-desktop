import type { Conversation } from "@letta-ai/letta-client/resources/conversations/conversations";
import { type Backend } from "./backend";
export type ConversationSearchBody = {
    query?: unknown;
    search_mode?: unknown;
    search_target?: unknown;
    limit?: unknown;
    agent_id?: unknown;
};
export type ConversationSearchResult = {
    embedded_text: string;
    conversation: Conversation;
    rrf_score: number;
};
export declare function searchConversationsForBackend(body: ConversationSearchBody, backend?: Backend): Promise<ConversationSearchResult[]>;
//# sourceMappingURL=conversation-search.d.ts.map