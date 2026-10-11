import type { ConversationCreateBody, ConversationUpdateBody } from "..";
import type { LocalAgentRecord, StoredConversation } from "./local-types";
export declare function isStringArray(value: unknown): value is string[];
export declare function createLocalConversationRecord(conversationId: string, agentId: string, body?: Partial<ConversationCreateBody>): StoredConversation;
export declare function agentFreeExecutionRecord(conversation: StoredConversation, executionAgentId: string): LocalAgentRecord;
export declare function parsePersistedLocalConversation(recordJson: string, executionAgentId: (conversationId: string) => string): StoredConversation | undefined;
export declare function updateLocalConversationRecord(current: StoredConversation, body: ConversationUpdateBody, updatedAt: string): StoredConversation;
//# sourceMappingURL=local-conversation-record.d.ts.map