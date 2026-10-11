import type { GitHubPullRequestSnapshot } from "./github-pull-request-types";
export interface GitHubPullRequestWatchDiff {
    events: string[];
    terminal: boolean;
}
export declare function diffGitHubPullRequestSnapshots(previous: GitHubPullRequestSnapshot, current: GitHubPullRequestSnapshot): GitHubPullRequestWatchDiff;
//# sourceMappingURL=github-pull-request-diff.d.ts.map