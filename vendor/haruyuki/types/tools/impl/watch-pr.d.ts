import type { GitHubPullRequestRef, GitHubPullRequestSnapshot } from "./github-pull-request-types";
interface WatchPullRequestArgs {
    url: string;
    parentScope?: {
        agentId: string;
        conversationId: string;
    };
    signal?: AbortSignal;
}
interface WatchPullRequestResult {
    content: Array<{
        type: "text";
        text: string;
    }>;
    taskId: string;
    url: string;
    headSha: string;
    persistent: true;
}
interface WatchPullRequestDeps {
    fetchSnapshot?: (ref: GitHubPullRequestRef, options: {
        cwd: string;
        signal?: AbortSignal;
    }) => Promise<GitHubPullRequestSnapshot>;
    wait?: (signal: AbortSignal, milliseconds: number) => Promise<void>;
    createOutputWriter?: (path: string) => {
        append(text: string): boolean;
    };
}
export declare function watch_pr(args: WatchPullRequestArgs, deps?: WatchPullRequestDeps): Promise<WatchPullRequestResult>;
export {};
//# sourceMappingURL=watch-pr.d.ts.map