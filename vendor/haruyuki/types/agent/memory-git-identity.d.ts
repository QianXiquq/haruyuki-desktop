/**
 * Who the harness attributes its own git commits to.
 *
 * Memory repositories used to carry a harness-owned identity
 * (`<product name> <noreply@letta.com>`, and `<agentId>@letta.com` per agent).
 * That hardcoded domain belongs to a project this fork is not, and the identity
 * was never the operator's, so GitHub could not link the commits to anyone.
 *
 * Resolution order:
 *   1. the operator's global git config (`user.name` / `user.email`),
 *   2. a neutral fork-local fallback, so a machine with no git identity yet
 *      still produces commits instead of failing.
 *
 * An unset global identity is the common case on a fresh machine, which is why
 * the fallback exists rather than an error.
 */
/** Author/committer name used when the operator has no global `user.name`. */
export declare const HARNESS_GIT_FALLBACK_NAME = "Haruyuki Code";
/** Author/committer email used when the operator has no global `user.email`. */
export declare const HARNESS_GIT_FALLBACK_EMAIL = "noreply@haruyuki.local";
export interface HarnessGitIdentity {
    name: string;
    email: string;
}
/**
 * Resolve the identity, shelling out to git only when the global config
 * location changed since the last call.
 */
export declare function harnessGitIdentity(): HarnessGitIdentity;
/** Drop the memoized identity. For tests that repoint the global git config. */
export declare function resetHarnessGitIdentityCache(): void;
//# sourceMappingURL=memory-git-identity.d.ts.map