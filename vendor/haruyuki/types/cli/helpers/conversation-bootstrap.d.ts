import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { Conversation } from "@letta-ai/letta-client/resources/conversations/conversations";
import { type ConversationSearchResult } from "../../backend/conversation-search";
export declare function extractBootstrapQueryText(content: MessageCreate["content"]): string;
export declare function filterBootstrapRelevantConversations(results: ConversationSearchResult[], params: {
    excludeConversationId?: string;
}): ConversationSearchResult[];
export declare function selectBootstrapRecentConversations(conversations: Conversation[], params: {
    excludeConversationId?: string;
    relevantConversationIds: Set<string>;
}): Conversation[];
export declare function buildConversationBootstrapReminder(params: {
    agentId: string;
    content: MessageCreate["content"];
    excludeConversationId?: string;
}): Promise<string | null>;
//# sourceMappingURL=conversation-bootstrap.d.ts.map