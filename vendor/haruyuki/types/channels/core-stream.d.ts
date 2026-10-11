import type { ChannelTurnProgressUpdate } from "./types";
export interface LettaStreamErrorParams {
    errorType?: string;
    message: string;
    detail?: string;
    runId?: string;
}
export interface CollectLettaSseAssistantTextResult {
    text: string;
    chunkCount: number;
    stopReason?: string;
}
export interface CollectLettaSseAssistantTextOptions {
    onDelta?: (delta: unknown) => void | Promise<void>;
    onProgressUpdate?: (update: ChannelTurnProgressUpdate) => void | Promise<void>;
    progressBuilder?: {
        buildUpdates(delta: unknown): ChannelTurnProgressUpdate[];
    };
}
export interface FormatLettaStreamCoreErrorOptions {
    includeDetail?: boolean;
}
export declare const HARUYUKI_STREAM_NO_ASSISTANT_MESSAGE_ERROR = "No assistant message received in stream";
export declare class LettaStreamCoreError extends Error {
    readonly errorType?: string;
    readonly detail?: string;
    readonly runId?: string;
    constructor(params: LettaStreamErrorParams);
}
export declare class LettaStreamNoAssistantMessageError extends Error {
    constructor();
}
export declare function formatLettaStreamCoreErrorForChannel(error: LettaStreamCoreError, options?: FormatLettaStreamCoreErrorOptions): string;
export declare function collectLettaSseAssistantText(body: ReadableStream<Uint8Array>, options?: CollectLettaSseAssistantTextOptions): Promise<CollectLettaSseAssistantTextResult>;
//# sourceMappingURL=core-stream.d.ts.map