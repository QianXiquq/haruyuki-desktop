import type { CredentialStore } from "@earendil-works/pi-ai";
/**
 * pi-ai CredentialStore over Letta's local provider records (auth.json),
 * keyed by pi-ai provider id. This makes the Models runtime the credential
 * source of truth: `Models.getAuth()` reads stored keys/OAuth tokens from
 * here and persists OAuth refreshes back through `modify`, which is
 * serialized per provider as the contract requires so concurrent requests
 * cannot double-refresh a rotated token. (auth.json writes are same-process
 * only today; cross-process locking would live in the auth store itself.)
 *
 * Records store more than credentials (base URLs, timeouts, regions) —
 * that remains Letta-owned provider config; only the credential facet is
 * exposed through this adapter, and provider-specific OAuth fields (e.g.
 * GitHub Copilot's enterpriseUrl) round-trip untouched.
 */
/** Local auth.json record names that serve a pi-ai provider id. */
export declare function localNamesForProviderId(providerId: string): readonly string[];
export declare function createLocalPiCredentialStore(storageDir?: string): CredentialStore;
//# sourceMappingURL=local-pi-credential-store.d.ts.map