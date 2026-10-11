export declare const CONVERSATION_BUSY_TITLE = "Turn still running";
export declare function isConversationBusyErrorText(errorText: string | null | undefined): boolean;
export declare function buildConversationBusyErrorBody(automaticRetry: boolean): string;
export declare function formatConversationBusyErrorMessage(options: {
    automaticRetry?: boolean;
    runId?: string;
}): string;
//# sourceMappingURL=conversation-busy-error.d.ts.map