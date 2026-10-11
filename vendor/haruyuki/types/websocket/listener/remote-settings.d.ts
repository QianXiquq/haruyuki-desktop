/**
 * Persistent remote session settings stored in ~/.haruyuki/remote-settings.json.
 *
 * Stores per-conversation CWD and permission mode so both survive haruyuki server
 * restarts. Mirrors the in-memory Map keys used by cwd.ts and permissionMode.ts.
 */
import type { PermissionMode } from "../../permissions/mode";
/** Persisted permission mode state for a single conversation. */
export interface PersistedPermissionModeState {
    mode: PermissionMode;
}
export interface RemoteSettings {
    cwdMap?: Record<string, string>;
    cwdRepairJournalIds?: string[];
    permissionModeMap?: Record<string, PersistedPermissionModeState>;
}
export declare function getRemoteSettingsPath(): string;
/**
 * Load remote settings synchronously from disk (called once at startup).
 * Populates the in-memory cache. Returns {} on any read/parse error.
 *
 * Applies a one-time migration: if cwdMap is absent, tries to load
 * the legacy ~/.haruyuki/cwd-cache.json.
 */
export declare function loadRemoteSettings(): RemoteSettings;
/**
 * Merge updates and queue the newest snapshot for serialized persistence.
 */
export declare function saveRemoteSettings(updates: Partial<RemoteSettings>): void;
/**
 * Queue an explicit cwd assignment even when it matches this process's cache.
 * Another listener may have published a conditional repair journal after our
 * cache was loaded; the unconditional set records that this user assignment is
 * newer than that repair when both are merged under the settings lock.
 */
export declare function saveRemoteSettingsCwdAssignment(scopeKey: string, workingDirectory: string): void;
/**
 * Attempt immediate repair persistence and fence older queued snapshots.
 * Transient failures stay queued for the asynchronous retry loop.
 */
export declare function saveRemoteSettingsSync(updates: Partial<RemoteSettings>): void;
export declare function flushRemoteSettingsWrites(): Promise<boolean>;
/**
 * Reset the in-memory cache (for testing).
 */
export declare function resetRemoteSettingsCache(): void;
//# sourceMappingURL=remote-settings.d.ts.map