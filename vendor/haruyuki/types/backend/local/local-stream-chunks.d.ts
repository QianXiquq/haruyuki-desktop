import type { AssistantMessageEvent } from "@earendil-works/pi-ai";
import type { LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
import type { LocalMessage } from "./local-message";
import type { StoredMessage } from "./local-types";
export type ProviderStreamPart = AssistantMessageEvent;
export declare function toStoredOutputFields(chunk: Record<string, unknown>): {
    [x: string]: unknown;
};
export interface LocalSegmentIdentity {
    contentStartIndex: number;
    useSourceMessageId: boolean;
}
/** Keep the provider segment identity without copying the response-so-far. */
export declare function attachLocalSegmentIdentity<T extends object>(target: T, identity: LocalSegmentIdentity): T;
/** Stream canonical local segment IDs instead of transient provider identities. */
export declare function canonicalizeLocalStreamChunk(chunk: LettaStreamingResponse, stored: StoredMessage, message: LocalMessage | undefined): StoredMessage;
export declare function attachLocalMessage<T extends object>(target: T, message: LocalMessage): T;
export declare function getAttachedLocalMessage(value: unknown): LocalMessage | undefined;
export declare function markLocalStateChunkOnly<T extends object>(target: T): T;
export declare function isLocalStateChunkOnly(value: unknown): boolean;
//# sourceMappingURL=local-stream-chunks.d.ts.map