import type { Message, Run } from "@letta-ai/letta-client/resources/agents/messages";
import type { StopReasonType } from "@letta-ai/letta-client/resources/runs/runs";
import type { ConversationSendStatus, ConversationStatusEvent, EnqueueReceipt, LatestConversationSuperRun } from "./backend/api/conversation-enqueue";
/** A send may span approval continuations. Only listener-published run IDs belong to it. */
export declare function getSendRunIds(status: ConversationSendStatus | null, clientMessageId: string): string[];
export declare function getConversationStatus(event: ConversationStatusEvent, conversationId: string): ConversationSendStatus | null | undefined;
export interface EnqueuedReply {
    text: string;
    runIds: string[];
    stopReason: StopReasonType | null;
}
export declare class EnqueuedWaitError extends Error {
    readonly runIds: string[];
    constructor(error: unknown, runIds: string[]);
}
/**
 * Subscribe before enqueue so even a fast recipient cannot finish before we
 * see its run-to-message mapping. Stream loss is a waiting error, never a resend.
 */
export declare function waitForEnqueuedReply(params: {
    receipt: EnqueueReceipt;
    events: AsyncIterator<ConversationStatusEvent>;
    firstEvent: ConversationStatusEvent;
    retrieveRun: (runId: string) => Promise<Run>;
    listRunMessages: (runId: string) => Promise<Message[]>;
    latestSuperRun: () => Promise<LatestConversationSuperRun | null>;
    signal: AbortSignal;
    pollMs?: number;
    now?: () => number;
}): Promise<EnqueuedReply>;
//# sourceMappingURL=headless-enqueue-wait.d.ts.map