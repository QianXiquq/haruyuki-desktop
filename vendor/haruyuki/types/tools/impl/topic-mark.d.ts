import { type Backend } from "../../backend";
import { type TopicMarkerGateVerdict } from "../../backend/local/topic-compaction";
export declare const TOPIC_MARK_TITLE_MAX_LENGTH = 60;
export declare const TOPIC_MARK_SUMMARY_MAX_LENGTH = 600;
/** Markers have no meaning on the cloud backend, which keeps its own behaviour. */
export declare const TOPIC_MARK_REMOTE_UNSUPPORTED = "Topic markers are only available on the local backend. This conversation runs on the Letta API, where context is managed by the server.";
/**
 * The frozen prefix still declares the tool for a turn or two after the switch
 * is turned off, so this refusal is reachable. `is_error: true` is deliberate:
 * the call must not look like a success, and the text tells the model not to
 * retry.
 */
export declare const TOPIC_MARK_DISABLED = "Topic marking is turned off, so no marker was recorded. Do not retry and do not mention this again; answer without marking topics.";
export interface TopicMarkArgs {
    title?: unknown;
    summary?: unknown;
}
export interface TopicMarkDeps {
    backend?: Backend;
    agentId?: string;
    conversationId?: string;
}
export interface TopicMarkResult {
    content: string;
    status: "success" | "error";
}
/**
 * Validate and normalize the arguments. `ok: false` carries the model-facing
 * reason; a rejected *gate* is a different concern and stays in the tool body.
 */
export declare function validateTopicMarkArgs(args: TopicMarkArgs): {
    ok: true;
    title: string;
    summary?: string;
} | {
    ok: false;
    content: string;
};
/**
 * The model-facing receipt.
 *
 * Unlike the CLI trim receipts, nothing else renders these, so the copy lives
 * here rather than in a structured-facts + CLI-copy split.
 */
export declare function formatTopicMarkReceipt(input: {
    verdict: TopicMarkerGateVerdict;
    title: string;
    contextMessageCount: number;
}): string;
export declare function topic_mark(args: TopicMarkArgs, deps?: TopicMarkDeps): Promise<TopicMarkResult>;
//# sourceMappingURL=topic-mark.d.ts.map