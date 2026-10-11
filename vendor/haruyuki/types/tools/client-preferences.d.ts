import type { ClientPreferences } from "../types/client-preferences";
/** Validate and canonicalize before comparing or persisting a snapshot. */
export declare function normalizeClientPreferences(value: unknown): ClientPreferences;
export declare function isClientPreferences(value: unknown): value is ClientPreferences;
/** Conversation-local settings also cover agent-free and virtual-default scopes. */
export declare function getStoredClientPreferences(agentId: string | null, conversationId?: string | null): ClientPreferences;
export declare function replaceClientPreferences(agentId: string | null, conversationId: string | null | undefined, preferences: ClientPreferences): void;
//# sourceMappingURL=client-preferences.d.ts.map