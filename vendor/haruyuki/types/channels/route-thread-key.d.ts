/**
 * Canonical thread keying for channel route identity.
 *
 * A route maps (channel, account, chat, thread) to one agent conversation.
 * Chats without a thread (for example a Slack DM outside any thread) still
 * need a stable key so every top-level message reuses the same route instead
 * of creating a new conversation per message. That key is
 * CHANNEL_ROOT_THREAD_KEY.
 *
 * The key is route identity only. It is not a platform thread id: outbound
 * replies for a root-keyed route must not target a thread. Use
 * channelRouteThreadIdFromKey to translate a persisted key back into a
 * nullable platform thread id.
 */
export declare const CHANNEL_ROOT_THREAD_KEY = "__root__";
/** Canonical route thread key: the trimmed thread id, or the root sentinel. */
export declare function resolveChannelRouteThreadKey(threadId?: string | null): string;
/** Translate a persisted route thread key back into a platform thread id. */
export declare function channelRouteThreadIdFromKey(threadKey?: string | null): string | null;
//# sourceMappingURL=route-thread-key.d.ts.map