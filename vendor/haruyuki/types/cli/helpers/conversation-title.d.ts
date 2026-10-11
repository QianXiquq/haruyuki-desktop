import type { Message } from "@letta-ai/letta-client/resources/agents/messages";
import type { Backend } from "../../backend";
/**
 * Maximum characters allowed for an auto-generated conversation title.
 */
export declare const CONVERSATION_TITLE_MAX_LENGTH = 100;
export type ConversationTitleMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};
export interface ConversationTitleSettingsSnapshot {
    enabled: boolean;
}
export declare function getConversationTitleSettings(): ConversationTitleSettingsSnapshot;
export declare function setConversationTitleSettings(enabled: boolean): ConversationTitleSettingsSnapshot;
/**
 * Strip whitespace, surrounding quotes, and clamp to {@link CONVERSATION_TITLE_MAX_LENGTH}.
 * Returns null when the input doesn't yield a usable title (empty, slash command, etc.).
 */
export declare function normalizeConversationTitle(value: string): string | null;
export declare function buildConversationTitleMessages(messages: Message[]): ConversationTitleMessage[];
export declare function listConversationTitleMessages(backend: Pick<Backend, "listConversationMessages">, conversationId: string): Promise<ConversationTitleMessage[]>;
export declare function generateConversationTitleFromSummary(conversationId: string, messages: ConversationTitleMessage[], model?: string): Promise<string | null>;
//# sourceMappingURL=conversation-title.d.ts.map