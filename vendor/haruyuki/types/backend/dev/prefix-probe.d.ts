import type { SimpleStreamOptions } from "@earendil-works/pi-ai";
/** Test-only: clear the per-conversation sequence counter between cases. */
export declare function resetPrefixProbeSequence(): void;
/** Wrap the existing `onPayload` hook with the probe writer. No-op unless the
 * `HARUYUKI_PREFIX_PROBE_DIR` environment variable is set.
 */
export declare function withPrefixProbe(existing: SimpleStreamOptions["onPayload"] | undefined, context: {
    conversationId: string;
    modelId?: string;
}): SimpleStreamOptions["onPayload"] | undefined;
export interface PrefixProbeRecord {
    conversationId: string;
    seq: number;
    payload: unknown;
}
export interface PrefixProbeComparison {
    fromSeq: number;
    toSeq: number;
    systemStable: boolean;
    toolsStable: boolean;
    /** Number of leading messages identical between the two turns. */
    commonMessagePrefix: number;
    laterMessageCount: number;
    /** True when the earlier message list is a byte-identical prefix of the later. */
    messagesAppended: boolean;
}
export interface PrefixProbeConversationReport {
    conversationId: string;
    turns: number;
    comparisons: PrefixProbeComparison[];
}
export interface PrefixProbeReport {
    conversations: PrefixProbeConversationReport[];
    systemStable: boolean;
    toolsStable: boolean;
    pass: boolean;
}
export declare function comparePrefixProbeTurns(previous: PrefixProbeRecord, next: PrefixProbeRecord): PrefixProbeComparison;
export declare function analyzePrefixProbe(records: readonly PrefixProbeRecord[]): PrefixProbeReport;
export declare function formatPrefixProbeReport(report: PrefixProbeReport): string;
//# sourceMappingURL=prefix-probe.d.ts.map