export type ChannelLifecycleErrorKind = "approval_pending" | "conversation_busy" | "database_lock_timeout" | "generic";
export interface ChannelLifecycleErrorDisplayOptions {
    automaticRetry?: boolean;
    runId?: string | null;
}
export interface ChannelLifecycleErrorDisplay {
    kind: ChannelLifecycleErrorKind;
    title: string;
    body: string;
    runId?: string;
}
export interface ChannelLifecycleErrorFormatOptions extends ChannelLifecycleErrorDisplayOptions {
    codeBlock?: boolean;
    maxLength?: number;
}
export declare const CHANNEL_LIFECYCLE_FALLBACK_ERROR_MESSAGE = "Something went wrong while processing that message. Please try again.";
export declare const CHANNEL_LIFECYCLE_APPROVAL_PENDING_MESSAGE = "The agent is still waiting on a tool approval from an earlier turn. Please approve or deny that pending request, then send your message again.";
export declare const CHANNEL_LIFECYCLE_TRANSIENT_ERROR_MESSAGE = "A temporary error interrupted this turn. Please try again.";
export declare const CHANNEL_LIFECYCLE_CONVERSATION_BUSY_TITLE = "Turn still running";
export declare function extractChannelLifecycleRunId(errorText: string | null | undefined): string | undefined;
export declare function sanitizeChannelLifecycleErrorText(errorText: string | null | undefined): string;
export declare function getChannelLifecycleErrorDisplay(errorText: string | null | undefined, options?: ChannelLifecycleErrorDisplayOptions): ChannelLifecycleErrorDisplay;
export declare function normalizeChannelLifecycleErrorMessage(errorText: string | null | undefined, options?: ChannelLifecycleErrorDisplayOptions): string;
export declare function formatChannelLifecycleErrorMessage(errorText: string | null | undefined, options?: ChannelLifecycleErrorFormatOptions): string;
//# sourceMappingURL=lifecycle-error.d.ts.map