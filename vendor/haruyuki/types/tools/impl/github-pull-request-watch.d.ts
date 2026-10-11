import type { GitHubPullRequestRef, GitHubPullRequestSnapshot } from "./github-pull-request-types";
interface GhRunOptions {
    cwd: string;
    signal?: AbortSignal;
    /**
     * `owner/repo` the command targets. `gh api graphql` carries no repository
     * in its arguments, so wrappers that pick credentials per repository (such
     * as the Letta Cloud sandbox gh wrapper) need it from `GH_REPO`.
     */
    repo?: string;
}
interface GitHubPullRequestWatchDeps {
    runGh?: (args: string[], options: GhRunOptions) => Promise<string>;
}
interface GitHubPullRequestSnapshotOptions {
    cwd: string;
    signal?: AbortSignal;
    deps?: GitHubPullRequestWatchDeps;
}
export declare function parseGitHubPullRequestUrl(urlValue: string): GitHubPullRequestRef;
export declare function fetchGitHubPullRequestSnapshot(ref: GitHubPullRequestRef, options: GitHubPullRequestSnapshotOptions): Promise<GitHubPullRequestSnapshot>;
export {};
//# sourceMappingURL=github-pull-request-watch.d.ts.map