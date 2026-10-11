/**
 * Serialization for `.git/config` mutations on the memory repo.
 *
 * `git config` takes an exclusive `.git/config.lock` for its whole
 * read-modify-write and exits non-zero rather than waiting, so two config
 * mutations against one repo cannot overlap. Memory-repo bootstrap has several
 * independent config writers — identity reconciliation, git-ops preparation,
 * and the credential helper — so contention is ordinary rather than
 * exceptional, and must not surface as a fatal error.
 *
 * Serializing removes the contention this process causes itself; the retry
 * covers writers it does not control (a second harness on the same agent, a
 * commit hook, or the operator's own git).
 */
/** Returns true when a git error is `.git/config` lock contention. */
export declare function isGitConfigLockError(error: unknown): boolean;
/**
 * Run `mutate` serialized against other config mutations of the same repo,
 * retrying while the config lock is held.
 *
 * `mutate` performs the git invocation; it is supplied by the caller so this
 * module stays free of the git runner (and of a cycle back to memory-git).
 * It may be invoked more than once, so it must be idempotent — every current
 * caller is a plain `git config` set/unset.
 */
export declare function withSerializedGitConfigMutation(dir: string, mutate: () => Promise<unknown>): Promise<void>;
//# sourceMappingURL=memory-git-config-lock.d.ts.map