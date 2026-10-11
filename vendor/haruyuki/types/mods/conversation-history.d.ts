import type { Message } from "@letta-ai/letta-client/resources/agents/messages";
import type { Backend } from "../backend";
import type { ModConversationHistoryOptions } from "./types";
export declare function loadModConversationHistoryFromBackend(backend: Pick<Backend, "listConversationMessages">, scope: {
    agentId?: string | null;
    conversationId?: string | null;
}, options?: ModConversationHistoryOptions): Promise<Message[]>;
//# sourceMappingURL=conversation-history.d.ts.map