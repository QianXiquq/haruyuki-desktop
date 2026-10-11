import type { OAuthAuth } from "@earendil-works/pi-ai";
import { type PiProviderOAuthConfig } from "./pi-provider-mod-registry";
/** Adapts a mod's declarative OAuth config onto pi-ai's OAuthAuth. */
export declare function modOAuthAuth(providerName: string, config: PiProviderOAuthConfig, registration?: {
    authHeader?: boolean;
}): OAuthAuth;
/**
 * OAuth implementation for a provider id: mod registration first (matching
 * the resolution order everywhere else), then built-in pi-ai providers.
 */
export declare function getProviderOAuthAuth(providerId: string): OAuthAuth | undefined;
/** Built-in providers that support subscription (OAuth) login. */
export declare function listBuiltinOAuthProviders(): Array<{
    id: string;
    name: string;
}>;
//# sourceMappingURL=pi-oauth.d.ts.map