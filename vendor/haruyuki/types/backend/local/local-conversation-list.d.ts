import type { Conversation } from "@letta-ai/letta-client/resources/conversations/conversations";
import type { ConversationListBody } from "../backend";
type ListableLocalConversation = Conversation & {
    hidden?: boolean;
};
export declare function listLocalConversations(source: Iterable<ListableLocalConversation>, body?: ConversationListBody): Conversation[];
export {};
//# sourceMappingURL=local-conversation-list.d.ts.map