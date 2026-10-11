export type SlackFileLike = {
    id?: string;
    name?: string;
    mimetype?: string;
    size?: number;
    url_private?: string;
    url_private_download?: string;
};
export type SlackAttachmentReadClient = {
    conversations: {
        history(args: {
            channel: string;
            latest?: string;
            oldest?: string;
            limit?: number;
            inclusive?: boolean;
        }): Promise<unknown>;
        replies(args: {
            channel: string;
            ts: string;
            limit?: number;
            inclusive?: boolean;
            cursor?: string;
        }): Promise<unknown>;
    };
};
export type SlackFileFetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
export type SlackFileMetadata = {
    fileName: string;
    mimeType?: string;
};
export type SlackFetchedFile = SlackFileMetadata & {
    body: ReadableStream<Uint8Array>;
    contentLength?: number;
};
/** Normalize, deduplicate, and cap the Slack files attached to one event/message. */
export declare function collectSlackFiles(rawEvent: unknown): SlackFileLike[];
/**
 * Find the exact Slack message and return only its files.
 *
 * `null` means the message was not present in the requested chat/thread. An
 * empty array means the message existed but had no files. This distinction lets
 * explicit downloads reject a file id without searching outside its source
 * message, while thin app_mention payloads can safely hydrate their canonical
 * files through conversations.replies.
 */
export declare function resolveSlackMessageFiles(params: {
    channelId: string;
    threadTs?: string | null;
    messageTs: string;
    client: SlackAttachmentReadClient;
}): Promise<SlackFileLike[] | null>;
export declare function resolveSlackFileMetadata(params: {
    file: SlackFileLike;
    url?: string;
    responseMimeType?: string;
}): SlackFileMetadata;
/**
 * Open a private Slack file without forwarding the bot token to another origin.
 * The returned body remains streaming; callers choose their own byte and idle
 * limits before materializing it.
 */
export declare function fetchSlackFile(params: {
    token: string;
    file: SlackFileLike;
    signal?: AbortSignal;
    fetcher?: SlackFileFetcher;
}): Promise<SlackFetchedFile>;
//# sourceMappingURL=attachment-primitives.d.ts.map