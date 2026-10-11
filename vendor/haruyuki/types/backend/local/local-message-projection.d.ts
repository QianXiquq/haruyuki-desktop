import type { ToolCall } from "@earendil-works/pi-ai";
import type { LocalAssistantMessage, LocalMessage, LocalToolResultMessage } from "./local-message";
import type { StoredMessage } from "./local-types";
export declare const LOCAL_REPAIRED_TOOL_RESULT_TEXT_MAX_CHARS = 40000;
type AssistantContent = LocalAssistantMessage["content"][number];
export declare function sourceLocalMessageIdFromStoredMessageId(messageId: string): string;
export declare function isLocalToolCallContent(content: AssistantContent): content is ToolCall;
export declare function projectLocalMessageToStoredMessages(message: LocalMessage, fallbackAgentId: string, fallbackConversationId: string, fallbackDate: string): StoredMessage[];
export declare function projectLocalMessagesToStoredMessages(messages: LocalMessage[], fallbackAgentId: string, fallbackConversationId: string): StoredMessage[];
export declare function withProjectedMessageDates(messages: StoredMessage[], _sourceMessageIndex: number): StoredMessage[];
export declare function projectedMessageLookupKeys(sourceMessage: LocalMessage, projected: StoredMessage[]): Array<[string, StoredMessage[]]>;
export declare function cloneLocalMessage(message: LocalMessage): LocalMessage;
export interface LocalToolResultRepairResult {
    messages: LocalMessage[];
    removedMessageIds: string[];
}
export declare function removeOrphanLocalToolResults(messages: readonly LocalMessage[]): LocalToolResultRepairResult;
export interface LocalToolResultClipResult {
    messages: LocalMessage[];
    clippedToolResultIds: string[];
}
export declare function clipOversizedLocalToolResults(messages: readonly LocalMessage[], options?: {
    maxToolResultTextChars?: number;
}): LocalToolResultClipResult;
export declare function mergeSnapshotContentWithExistingToolCalls(snapshotContent: LocalAssistantMessage["content"], existingContent: LocalAssistantMessage["content"]): LocalAssistantMessage["content"];
export declare function findToolResultForCall(messages: LocalMessage[], toolCallId: string): LocalToolResultMessage | undefined;
export {};
//# sourceMappingURL=local-message-projection.d.ts.map