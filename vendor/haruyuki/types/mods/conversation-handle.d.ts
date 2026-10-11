import type { Backend } from "../backend";
import type { ModConversationHandle, ModConversationMessage, ModConversationSendMessageOptions, ModConversationSendMessageRequestOptions } from "./types";
type SendModConversationMessageStream = (backend: Backend, conversationId: string, messages: ModConversationMessage[], options?: ModConversationSendMessageOptions & {
    agentId?: string;
}, requestOptions?: ModConversationSendMessageRequestOptions) => ReturnType<ModConversationHandle["sendMessageStream"]>;
export declare function createModConversationHandle(options: {
    agentId?: string | null;
    backend?: Backend;
    conversationId?: string | null;
    sendMessageStream: SendModConversationMessageStream;
    workingDirectory?: string | null;
}): ModConversationHandle;
export {};
//# sourceMappingURL=conversation-handle.d.ts.map