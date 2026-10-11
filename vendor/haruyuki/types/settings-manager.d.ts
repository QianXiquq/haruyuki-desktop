import { type AgentBackendMode } from "./agent/agent-id";
import { type AgentSettings } from "./agent-settings";
import type { ExperimentId } from "./experiments/types";
import type { HooksConfig } from "./hooks/types";
import type { McpServerConfig } from "./mcp-client";
import type { PermissionRules } from "./permissions/types";
import type { ReflectionMergeMode, ReflectionTrigger, StoredReflectionSettings } from "./reflection-settings";
import type { ToolsetPreference } from "./tools/toolset-types";
import type { ClientPreferences } from "./types/client-preferences";
import { type SecureTokens } from "./utils/secrets.js";
/**
 * Reference to a session (agent + conversation pair).
 * Always tracked together since a conversation belongs to exactly one agent.
 */
export interface SessionRef {
    agentId: string;
    conversationId: string;
}
export interface WindowTitleConfig {
    items: string[];
}
export type { AgentSettings } from "./agent-settings";
export interface Settings {
    lastAgent: string | null;
    lastSession?: SessionRef;
    tokenStreaming: boolean;
    reasoningTabCycleEnabled: boolean;
    showCompactions?: boolean;
    sessionContextEnabled: boolean;
    autoConversationTitles: boolean;
    autoConversationTitlesRollbackApplied?: boolean;
    includeWorktreeTool: boolean;
    topicMarkingEnabled: boolean;
    preferredBackendMode?: "api" | "local";
    channelCredentialsStore?: "file" | "keyring" | "auto";
    recentModels: string[];
    memoryReminderInterval: number | null | "compaction" | "auto-compaction";
    reflectionTrigger: ReflectionTrigger;
    reflectionStepCount: number;
    reflectionMerge: ReflectionMergeMode;
    reflectionMergeInstructions: string;
    reflectionSettingsByAgent?: Record<string, StoredReflectionSettings>;
    conversationSwitchAlertEnabled: boolean;
    profiles?: Record<string, string>;
    createDefaultAgents?: boolean;
    permissions?: PermissionRules;
    hooks?: HooksConfig;
    windowTitle?: WindowTitleConfig;
    env?: Record<string, string>;
    experiments?: Partial<Record<ExperimentId, boolean>>;
    sessionsByServer?: Record<string, SessionRef>;
    agents?: AgentSettings[];
    refreshToken?: string;
    tokenExpiresAt?: number;
    deviceId?: string;
    lastSeenReleaseNotesVersion?: string;
    oauthState?: {
        state: string;
        codeVerifier: string;
        redirectUri: string;
        provider: "openai";
        timestamp: number;
    };
}
export interface StartupBackendSettings {
    preferredBackendMode?: Settings["preferredBackendMode"];
    envBaseUrl?: string;
}
export interface WorktreeProjectConfig {
    symlinkDirectories?: string[];
    copyLocalSettings?: boolean;
    linkHooks?: boolean;
    include?: string[];
}
export interface ProjectSettings {
    hooks?: HooksConfig;
    windowTitle?: WindowTitleConfig;
}
export interface LocalProjectSettings {
    lastAgent: string | null;
    lastSession?: SessionRef;
    permissions?: PermissionRules;
    hooks?: HooksConfig;
    windowTitle?: WindowTitleConfig;
    profiles?: Record<string, string>;
    memoryReminderInterval?: number | null | "compaction" | "auto-compaction";
    reflectionTrigger?: ReflectionTrigger;
    reflectionStepCount?: number;
    reflectionMerge?: ReflectionMergeMode;
    reflectionMergeInstructions?: string;
    reflectionSettingsByAgent?: Record<string, StoredReflectionSettings>;
    sessionsByServer?: Record<string, SessionRef>;
    listenerEnvName?: string;
}
export declare function shouldPersistSessionState(): boolean;
declare class SettingsManager {
    private settings;
    private projectSettings;
    private localProjectSettings;
    private initialized;
    private pendingWrites;
    private secretsAvailable;
    private managedKeys;
    private dirtyKeys;
    private secureTokensCache;
    private markDirty;
    private updateSecureTokensCache;
    private clearSecureTokensCache;
    private readJsonObjectSync;
    /**
     * Whether the settings manager has been initialized.
     */
    get isReady(): boolean;
    /**
     * Initialize the settings manager (loads from disk)
     * Should be called once at app startup
     */
    initialize(): Promise<void>;
    /**
     * Check secrets support and warn user if not available
     */
    private checkSecretsSupport;
    /**
     * Migrate tokens from old storage location to secrets
     */
    private migrateTokensToSecrets;
    /**
     * Get all settings (synchronous, from memory)
     * Note: Does not include secure tokens (API key, refresh token) from secrets
     */
    getSettings(): Settings;
    /**
     * Get all settings including secure tokens from secrets (async)
     */
    getSettingsWithSecureTokens(): Promise<Settings>;
    /**
     * Get a specific setting value (synchronous)
     */
    getSetting<K extends keyof Settings>(key: K): Settings[K];
    shouldIncludeWorktreeTool(): boolean;
    getRecentModels(): string[];
    addRecentModel(modelId: string): void;
    getCachedSecureTokens(): SecureTokens;
    /**
     * Get or create device ID (generates UUID if not exists)
     */
    getOrCreateDeviceId(): string;
    /**
     * Update settings (synchronous in-memory, async persist)
     */
    updateSettings(updates: Partial<Settings>): void;
    /**
     * Persist settings and tokens, with fallback for secrets unavailability
     */
    private persistSettingsAndTokens;
    /**
     * Load project settings for a specific directory
     */
    loadProjectSettings(workingDirectory?: string): Promise<ProjectSettings>;
    /**
     * Get project settings (synchronous, from memory)
     */
    getProjectSettings(workingDirectory?: string): ProjectSettings;
    /**
     * Update project settings (synchronous in-memory, async persist)
     */
    updateProjectSettings(updates: Partial<ProjectSettings>, workingDirectory?: string): void;
    /**
     * Persist settings to disk (private helper)
     */
    private persistSettings;
    /**
     * Persist project settings to disk (private helper)
     */
    private persistProjectSettings;
    private getSettingsPath;
    private getProjectSettingsPath;
    private isProjectSettingsPathCollidingWithGlobal;
    private getLocalProjectSettingsPath;
    /**
     * Load local project settings (.haruyuki/settings.local.json)
     */
    loadLocalProjectSettings(workingDirectory?: string): Promise<LocalProjectSettings>;
    /**
     * Get local project settings (synchronous, from memory)
     */
    getLocalProjectSettings(workingDirectory?: string): LocalProjectSettings;
    /**
     * Update local project settings (synchronous in-memory, async persist)
     */
    updateLocalProjectSettings(updates: Partial<LocalProjectSettings>, workingDirectory?: string): void;
    /**
     * Persist local project settings to disk (private helper)
     */
    private persistLocalProjectSettings;
    /**
     * Get the last session from global settings for the current server.
     * Looks up by server key first, falls back to legacy lastSession for migration.
     * Returns null if no session is available.
     */
    getGlobalLastSession(): SessionRef | null;
    /**
     * Get the last agent ID from global settings for the current server.
     * Returns the agentId from server-indexed session if available,
     * otherwise falls back to legacy lastSession/lastAgent.
     */
    getGlobalLastAgentId(): string | null;
    /**
     * Set the last session in global settings for the current server.
     * Writes to both server-indexed and legacy fields for backwards compat.
     */
    setGlobalLastSession(session: SessionRef): void;
    /**
     * Get the last session from local project settings for the current server.
     * Looks up by server key first, falls back to legacy lastSession for migration.
     * Returns null if no session is available.
     */
    getLocalLastSession(workingDirectory?: string): SessionRef | null;
    /**
     * Get the last agent ID from local project settings for the current server.
     * Returns the agentId from server-indexed session if available,
     * otherwise falls back to legacy lastSession/lastAgent.
     */
    getLocalLastAgentId(workingDirectory?: string): string | null;
    /**
     * Set the last session in local project settings for the current server.
     * Writes to both server-indexed and legacy fields for backwards compat.
     */
    setLocalLastSession(session: SessionRef, workingDirectory?: string): void;
    /**
     * Get the effective last session (local overrides global).
     * Returns null if no session is available anywhere.
     */
    getEffectiveLastSession(workingDirectory?: string): SessionRef | null;
    /**
     * Get the effective last agent ID (local overrides global).
     * Useful for migration when we need an agent but don't have a conversation yet.
     */
    getEffectiveLastAgentId(workingDirectory?: string): string | null;
    /**
     * Persist the current session (agent + conversation) to both local and global
     * settings, plus the legacy lastAgent fields for backwards compat.
     *
     * This is the single entry-point every conversation/agent switch should use
     * instead of calling setLocalLastSession + setGlobalLastSession individually.
     */
    persistSession(agentId: string, conversationId: string, workingDirectory?: string): void;
    /**
     * Get pinned agent IDs for the currently-active server.
     */
    getPinnedAgents(): string[];
    /**
     * Get pinned agent IDs scoped to a specific backend mode, independent of the
     * currently-active backend. Used to look up pins across modes (e.g. --name).
     */
    getPinnedAgentsForBackendMode(mode: AgentBackendMode): string[];
    /**
     * Get pinned agent IDs for an explicit server key. The server key both
     * namespaces by server (baseUrl) and encodes the backend mode (the "local:"
     * prefix), so agent-id/backend compatibility is derived from it directly —
     * no separate backend-mode argument is needed.
     */
    getPinnedAgentsForServerKey(serverKey: string): string[];
    /**
     * Check if an agent is pinned for the current server.
     */
    isAgentPinned(agentId: string): boolean;
    /**
     * Pin an agent for the current server.
     */
    pinAgent(agentId: string): void;
    /**
     * Unpin an agent for the current server.
     */
    unpinAgent(agentId: string): void;
    getGlobalProfiles(): Record<string, string>;
    getLocalProfiles(workingDirectory?: string): Record<string, string>;
    getMergedProfiles(_workingDirectory?: string): Array<{
        name: string;
        agentId: string;
        isLocal: boolean;
    }>;
    /**
     * Check if default agents (Memo/Incognito) should be created on startup.
     * Defaults to true if not explicitly set to false.
     */
    shouldCreateDefaultAgents(): boolean;
    /**
     * Get saved listener environment name from local project settings (if any).
     * Returns undefined if not set or settings not loaded.
     */
    getListenerEnvName(workingDirectory?: string): string | undefined;
    /**
     * Save listener environment name to local project settings.
     * Loads settings if not already loaded.
     */
    setListenerEnvName(envName: string, workingDirectory?: string): void;
    /**
     * Get settings for a specific agent on the current server.
     * Returns undefined if agent not found in settings.
     */
    private getAgentSettings;
    /**
     * Create or update settings for a specific agent on the current server.
     */
    private upsertAgentSettings;
    /**
     * Check if memory filesystem is enabled for an agent on the current server.
     */
    isMemfsEnabled(agentId: string): boolean;
    /**
     * Whether memfs was EXPLICITLY disabled for this agent (memfs: false in
     * settings) — distinct from "never configured". Worker-style agents
     * created memfs-less record this so lazy repair paths don't re-enable.
     */
    isMemfsExplicitlyDisabled(agentId: string): boolean;
    /**
     * Enable or disable memory filesystem for an agent on the current server.
     */
    setMemfsEnabled(agentId: string, enabled: boolean): void;
    getMcpServers(agentId: string): McpServerConfig[];
    setMcpServers(agentId: string, servers: McpServerConfig[]): void;
    /** Resolve the manual override for one conversation; unset means auto. */
    getToolsetPreference(agentId: string, conversationId?: string): ToolsetPreference;
    /** Persist a manual override for one conversation; auto clears it. */
    setToolsetPreference(agentId: string, preference: ToolsetPreference, conversationId?: string): void;
    getClientPreferences(agentId: string, conversationId?: string): ClientPreferences;
    setClientPreferences(agentId: string, conversationId: string, preferences: ClientPreferences): void;
    /**
     * Get the stored system prompt preset for an agent on the current server.
     */
    getSystemPromptPreset(agentId: string): string | undefined;
    /**
     * Get the stored hash for the managed system prompt on the current server.
     */
    getSystemPromptHash(agentId: string): string | undefined;
    /**
     * Get the Haruyuki version that last wrote the managed system prompt hash.
     */
    getSystemPromptVersion(agentId: string): string | undefined;
    /**
     * Set the system prompt preset for an agent on the current server.
     */
    setSystemPromptPreset(agentId: string, preset: string): void;
    /**
     * Store the managed system prompt metadata for an agent on the current server.
     */
    setManagedSystemPrompt(agentId: string, prompt: {
        preset: string;
        hash: string;
        version: string;
    }): void;
    /**
     * Mark an agent's system prompt as custom and clear managed prompt metadata.
     */
    setSystemPromptCustom(agentId: string): void;
    /**
     * Clear the stored system prompt preset for an agent (e.g., after switching to a subagent prompt).
     */
    clearSystemPromptPreset(agentId: string): void;
    /**
     * Check if local .haruyuki directory exists (indicates existing project)
     */
    hasLocalHaruyukiDir(workingDirectory?: string): boolean;
    /**
     * Store OAuth state for pending authorization
     */
    storeOAuthState(state: string, codeVerifier: string, redirectUri: string, provider: "openai"): void;
    /**
     * Get pending OAuth state
     */
    getOAuthState(): Settings["oauthState"] | null;
    /**
     * Clear pending OAuth state
     */
    clearOAuthState(): void;
    /**
     * Check if secrets are available
     */
    isKeychainAvailable(): Promise<boolean>;
    /**
     * Get secure tokens from secrets
     */
    getSecureTokens(): Promise<SecureTokens>;
    /**
     * Store secure tokens in secrets
     */
    setSecureTokens(tokens: SecureTokens): Promise<void>;
    /**
     * Delete secure tokens from secrets
     */
    deleteSecureTokens(): Promise<void>;
    /**
     * Wait for all pending writes to complete.
     * Useful in tests to ensure writes finish before cleanup.
     */
    flush(): Promise<void>;
    /**
     * Logout - clear all tokens and sensitive authentication data
     */
    logout(): Promise<void>;
    /**
     * Clear in-memory caches so the next read re-loads from disk.
     * Unlike reset(), this preserves the initialized state and pending writes.
     * Used by /reload to pick up settings changes without a full restart.
     */
    clearCaches(): void;
    /**
     * Reset the manager (mainly for testing).
     * Waits for pending writes to complete before resetting.
     */
    reset(): Promise<void>;
    /**
     * Read the small subset of settings needed before CLI subcommand routing.
     * This intentionally avoids full SettingsManager initialization, which can
     * create defaults, mark dirty keys, and perform migrations/writes.
     */
    readStartupBackendSettingsSync(): StartupBackendSettings;
}
declare global {
    var __haruyukiSettingsManager: SettingsManager | undefined;
}
export declare const settingsManager: SettingsManager;
//# sourceMappingURL=settings-manager.d.ts.map