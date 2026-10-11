/**
 * Git hook scripts installed into agent and shared memory repositories.
 *
 * The pre-commit hook validates memory markdown frontmatter; the post-commit
 * hook mirrors commits to an optional user-configured memory-repository
 * remote. Both are (re)installed by the CLI harness on clone/pull/init —
 * see memory-git.ts.
 */
/**
 * Bash pre-commit hook that validates frontmatter in memory .md files.
 *
 * Rules:
 * - Frontmatter is REQUIRED (must start with ---)
 * - Must be properly closed with ---
 * - Required fields: description (non-empty string)
 * - read_only is a PROTECTED field: agent cannot add, remove, or change it.
 *   Files where HEAD has read_only: true cannot be modified at all.
 * - Only allowed agent-editable key: description
 * - Legacy key 'limit' is tolerated for backward compatibility
 * - read_only may exist (from server) but agent must not change it
 * - Optional file-size and depth constraints come from .memfs.config.json
 */
export declare function buildPreCommitHookScript(options?: {
    execPath?: string;
    electron?: boolean;
    platform?: NodeJS.Platform;
}): string;
export declare const PRE_COMMIT_HOOK_SCRIPT: string;
export declare function installPreCommitHook(dir: string, allowRootMemoryLayout?: boolean): void;
/** Refresh validation for a local-only repository without changing its layout. */
export declare function installLocalMemoryPreCommitHook(dir: string): void;
/** Install memory validation for an attached shared repository. */
export declare function installSharedMemoryPreCommitHook(dir: string): void;
/**
 * Bash post-commit hook that pushes memfs commits to an optional additional
 * git remote (the "memory repository" endpoint).
 *
 * Reads the remote URL from the repo's local git config
 * (`letta.memoryRepository.url`). No-op when the key is unset. Push runs
 * asynchronously in the background so commits stay fast, and failures are
 * logged to `.git/memory-repository-push.log` without blocking the user.
 *
 * URL is per-repo by design: each agent's memfs repo has its own `.git/config`,
 * so the endpoint is scoped to a single agent automatically.
 */
export declare const POST_COMMIT_HOOK_SCRIPT = "#!/usr/bin/env bash\n# Haruyuki: push memfs commits to the configured memory-repository remote.\n# Installed by Haruyuki CLI. Do not edit by hand \u2014 regenerated on startup.\nurl=$(git config --local --get letta.memoryRepository.url 2>/dev/null)\n[ -z \"$url\" ] && exit 0\nbranch=$(git symbolic-ref --quiet --short HEAD 2>/dev/null) || exit 0\n[ -z \"$branch\" ] && exit 0\n# Reflection and other harness worktrees commit on temporary branches; only the\n# main MemFS checkout should push to the optional memory repository remote.\n[ \"$branch\" != \"main\" ] && exit 0\nlog=\"$(git rev-parse --git-dir)/memory-repository-push.log\"\n(\n  {\n    printf '\\n--- %s %s on %s ---\\n' \"$(date '+%Y-%m-%dT%H:%M:%S%z')\" \"$(git rev-parse --short HEAD)\" \"$branch\"\n    git push --quiet \"$url\" \"$branch\":\"$branch\" 2>&1\n    echo \"exit=$?\"\n  } >> \"$log\" 2>&1\n) &\ndisown 2>/dev/null || true\nexit 0\n";
/**
 * Install the post-commit hook that pushes to `letta.memoryRepository.url`.
 * Hook is harmless when the config key is unset (no-ops on every commit).
 */
export declare function installPostCommitHook(dir: string): void;
/** Refresh every harness-owned Git hook for an API-backed memory checkout. */
export declare function installMemoryGitHooks(dir: string): void;
//# sourceMappingURL=memory-git-hooks.d.ts.map