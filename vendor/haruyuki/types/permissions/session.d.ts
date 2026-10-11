import type { PermissionRules, PermissionRuleType } from "./types";
/**
 * Session-only permissions that are not persisted to disk.
 * These rules are cleared when the application exits.
 */
declare class SessionPermissions {
    private sessionRules;
    /**
     * Add a permission rule for this session only
     */
    addRule(rule: string, type: PermissionRuleType): void;
    /**
     * Get all session rules
     */
    getRules(): PermissionRules;
    /**
     * Clear all session rules
     */
    clear(): void;
    /**
     * Check if a rule exists in session permissions
     */
    hasRule(rule: string, type: PermissionRuleType): boolean;
}
export declare const sessionPermissions: SessionPermissions;
export {};
//# sourceMappingURL=session.d.ts.map