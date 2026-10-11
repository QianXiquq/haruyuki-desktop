export declare const HARUYUKI_MEMFS_GIT_PROXY_BASE_URL_ENV = "HARUYUKI_MEMFS_GIT_PROXY_BASE_URL";
export interface MemfsGitProxyRewriteConfig {
    /** Ephemeral proxy base URL used only for git transport. */
    proxyBaseUrl: string;
    /** Canonical memfs base URL that remains persisted in git config/settings. */
    memfsBaseUrl: string;
    /** Git URL prefix for the ephemeral transport. */
    proxyPrefix: string;
    /** Git URL prefix for the canonical remote. */
    memfsPrefix: string;
    /** Git config key for url.<proxyPrefix>.insteadOf. */
    configKey: string;
    /** Git config value for url.<proxyPrefix>.insteadOf. */
    configValue: string;
}
/**
 * Get the current haruyuki memfs server URL from environment or settings.
 * Falls back to the local server when no memfs-specific URL is set.
 *
 * Intentionally ignores LETTA_BASE_URL: Desktop sets LETTA_BASE_URL to an
 * ephemeral localhost proxy port, but MemFS git config/settings must stay
 * keyed by a stable canonical URL. Desktop's transient git transport proxy is
 * handled separately by HARUYUKI_MEMFS_GIT_PROXY_BASE_URL.
 */
export declare function getMemfsServerUrl(): string;
/**
 * Resolve Desktop's transient MemFS git proxy rewrite, if configured.
 *
 * HARUYUKI_MEMFS_GIT_PROXY_BASE_URL is intentionally transport-only: it should
 * never be used for settings keys, persisted remotes, or credential helper
 * config. It lets Desktop route git network traffic through its localhost
 * proxy while keeping the local repo's origin canonical and stable.
 */
export declare function getMemfsGitProxyRewriteConfig(env?: NodeJS.ProcessEnv): MemfsGitProxyRewriteConfig | null;
//# sourceMappingURL=memfs-git-proxy.d.ts.map