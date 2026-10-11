/**
 * Default haruyuki server for a local install.
 *
 * Cloud is deliberately not a default anywhere: with no `LETTA_BASE_URL` and no
 * saved env override, requests and skill scripts target the self-hosted server
 * on its documented port (`haruyuki server`, `docker run -p 8283:8283`). Nothing
 * reaches the network unless something is actually listening there.
 */
export declare const DEFAULT_LOCAL_SERVER_URL = "http://localhost:8283";
/**
 * The server URL a user explicitly configured (env, then settings), if any.
 *
 * Callers that must not invent a server — probing a self-hosted install, or
 * deriving a persisted git remote — use this and skip when it is undefined.
 */
export declare function getConfiguredServerUrl(): string | undefined;
/**
 * Get the current haruyuki server URL from environment or settings.
 * Used for cache keys and API operations.
 */
export declare function getServerUrl(): string;
/**
 * True when the configured server is Letta Cloud (matched by hostname).
 * Cloud-only concepts such as computers/environment routing key off this.
 *
 * Before ④-9 this was true by default because the URL default was Cloud; now it
 * is true only when a user explicitly points `LETTA_BASE_URL` at Cloud.
 */
export declare function isCloudServerUrl(serverUrl?: string): boolean;
//# sourceMappingURL=server-url.d.ts.map