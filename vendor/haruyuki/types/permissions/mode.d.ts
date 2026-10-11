export type PermissionMode = "standard" | "acceptEdits" | "unrestricted" | "strict";
/** The default starting permission mode. */
export declare const DEFAULT_PERMISSION_MODE: PermissionMode;
/** All valid current permission mode values. */
export declare const VALID_PERMISSION_MODES: readonly PermissionMode[];
/**
 * Migrate legacy permission mode strings to their current equivalents.
 * - "default" → "standard" (renamed for clarity)
 * - "bypassPermissions" → "unrestricted" (renamed for clarity)
 * Returns null if the value is not a recognized mode (current or legacy).
 */
export declare function migratePermissionMode(value: string): PermissionMode | null;
/**
 * Result of a permission-mode check: the mode auto-allows the tool. A `null`
 * result (not this type) means the mode doesn't apply and normal permission
 * flow continues. The caller surfaces a generic `"Permission mode: {mode}"`
 * message.
 */
export interface ModeOverrideResult {
    decision: "allow";
}
/**
 * Permission mode state for the current session.
 * Set via CLI --permission-mode flag or settings.json defaultMode.
 */
declare class PermissionModeManager {
    private get currentMode();
    private set currentMode(value);
    /**
     * Set the permission mode for this session
     */
    setMode(mode: PermissionMode): void;
    /**
     * Get the current permission mode
     */
    getMode(): PermissionMode;
    /**
     * Check if a tool should be auto-allowed based on current mode.
     * Accepts an explicit `mode` override so callers with a
     * scoped PermissionModeState (listener/remote mode) can bypass the global
     * singleton without requiring a temporary mutation of global state.
     * Returns null if mode doesn't apply to this tool.
     */
    checkModeOverride(toolName: string, modeOverride?: PermissionMode): ModeOverrideResult | null;
    /**
     * Check if strict mode is active (all tools require explicit approval).
     */
    isStrict(modeOverride?: PermissionMode): boolean;
    /**
     * Reset to default mode
     */
    reset(): void;
}
export declare const permissionMode: PermissionModeManager;
export {};
//# sourceMappingURL=mode.d.ts.map