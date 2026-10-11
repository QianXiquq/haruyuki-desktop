import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
/** Per-message authorship, independent of the request's acting user and billing. */
export type AttributedMessageCreate = MessageCreate & {
    attribution?: {
        acting_user_id?: string;
    };
};
/** Preserve explicit bearer attribution and stamp only legacy human inputs. */
export declare function withMessageAttribution<T extends MessageCreate>(message: T, actingUserId?: string): T & AttributedMessageCreate;
//# sourceMappingURL=message-attribution.d.ts.map