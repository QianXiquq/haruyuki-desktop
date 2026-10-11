import type { Run } from "@letta-ai/letta-client/resources/agents/messages";
import type { StreamRequestContext } from "../../agent/message";
import type { ApprovalRequest } from "./stream-processor";
export type StreamResumePolicy = {
    initialDelayMs: number;
    maxAttempts: number;
    maxDelayMs: number;
};
type RunsListResponse = Run[] | {
    getPaginatedItems?: () => Run[];
};
export type RunsListClient = {
    runs: {
        list: (query: {
            conversation_id?: string | null;
            agent_id?: string | null;
            statuses?: string[] | null;
            order?: string | null;
            limit?: number | null;
        }) => Promise<RunsListResponse>;
    };
};
export declare function discoverFallbackRunIdWithTimeout(ctx: StreamRequestContext): Promise<string | null>;
/**
 * Attempt to discover a run ID to resume when the initial stream failed before
 * any run_id-bearing chunk arrived.
 */
export declare function discoverFallbackRunIdForResume(client: RunsListClient, ctx: StreamRequestContext): Promise<string | null>;
export declare function isReplayableRun(run: Run): boolean;
export declare function waitForResumeRetry(delayMs: number, abortSignal: AbortSignal): Promise<boolean>;
export declare function mergeApprovalRequests(previous: ApprovalRequest[] | undefined, next: ApprovalRequest[] | undefined): ApprovalRequest[];
export {};
//# sourceMappingURL=stream-resume.d.ts.map