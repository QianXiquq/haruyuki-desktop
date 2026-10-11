import type { PermissionRules, PermissionRuleType } from "./types";
type UserSettingsPathsOptions = {
    homeDir?: string;
    xdgConfigHome?: string;
};
export declare function getUserSettingsPaths(options?: UserSettingsPathsOptions): {
    canonical: string;
    legacy: string;
};
export declare function resetPermissionLoaderCacheForTests(): void;
/**
 * Load permissions from all settings files and merge them hierarchically.
 *
 * Precedence (highest to lowest):
 * 1. Local project settings (.haruyuki/settings.local.json)
 * 2. Project settings (.haruyuki/settings.json)
 * 3. User settings (~/.haruyuki/settings.json)
 * 4. Legacy user settings (~/.config/haruyuki/settings.json)
 *
 * Rules are merged by concatenating arrays (more specific settings add to broader ones)
 */
export declare function loadPermissions(workingDirectory?: string): Promise<PermissionRules>;
export declare function loadPermissionMode(workingDirectory?: string): Promise<PermissionRules["mode"] | null>;
/**
 * Save a permission rule to a specific scope
 */
export declare function savePermissionRule(rule: string, ruleType: PermissionRuleType, scope: "project" | "local" | "user", workingDirectory?: string): Promise<void>;
export {};
//# sourceMappingURL=loader.d.ts.map