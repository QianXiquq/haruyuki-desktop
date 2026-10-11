import type { GitHubPullRequestSnapshot, PullRequestCheck, PullRequestReviewThread } from "./github-pull-request-types";
export declare function shortGitHubPullRequestSha(sha: string): string;
export declare function pendingGitHubPullRequestChecks(snapshot: GitHubPullRequestSnapshot): PullRequestCheck[];
export declare function failedGitHubPullRequestChecks(snapshot: GitHubPullRequestSnapshot): PullRequestCheck[];
export declare function unresolvedGitHubPullRequestThreads(snapshot: GitHubPullRequestSnapshot): PullRequestReviewThread[];
export declare function hasGitHubPullRequestReadyConditions(snapshot: GitHubPullRequestSnapshot): boolean;
export declare function isGitHubPullRequestReady(snapshot: GitHubPullRequestSnapshot): boolean;
export declare function githubPullRequestCheckSummary(snapshot: GitHubPullRequestSnapshot): string;
export declare function githubPullRequestBlockerSummary(snapshot: GitHubPullRequestSnapshot): string;
export declare function describeGitHubPullRequestSnapshot(snapshot: GitHubPullRequestSnapshot): string;
//# sourceMappingURL=github-pull-request-state.d.ts.map