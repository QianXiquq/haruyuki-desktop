/**
 * CLI permission overrides that are set via --allowedTools and --disallowedTools flags.
 * These rules override settings.json permissions for the current session.
 */
export declare class CliPermissions {
    private allowedTools;
    private disallowedTools;
    private memoryGuardDisabled;
    /**
     * Parse and set allowed tools from CLI flag
     * Format: "Bash,Read" or "Bash(npm install),Read(src/**)"
     */
    setAllowedTools(toolsString: string): void;
    /**
     * Parse and set disallowed tools from CLI flag
     * Format: "WebFetch,Bash(curl:*)"
     */
    setDisallowedTools(toolsString: string): void;
    /**
     * Disable the cross-agent memory guard for this parent CLI process. Parent
     * processes start guarded by default; this is only set by the explicit
     * --disable-memory-guard override. Subagent processes ignore this setting
     * when evaluating the guard.
     */
    setMemoryGuardDisabled(disabled: boolean): void;
    /**
     * Parse comma-separated tool list into individual patterns
     * Handles: "Bash,Read" and "Bash(npm install),Read(src/**)"
     *
     * Special handling:
     * - "Bash" without params becomes "Bash(:*)" to match all Bash commands
     * - "Read" without params becomes "Read" (matches all Read calls)
     */
    private parseToolList;
    /**
     * Normalize a tool pattern.
     * - "Bash" becomes "Bash(:*)" to match all commands
     * - File tools (Read, Write, Edit, Glob, Grep) become "ToolName(**)" to match all files
     * - Tool patterns with parentheses stay as-is
     */
    private normalizePattern;
    /**
     * Get all allowed tool patterns
     */
    getAllowedTools(): string[];
    /**
     * Get all disallowed tool patterns
     */
    getDisallowedTools(): string[];
    /**
     * Whether --disable-memory-guard was set on the CLI.
     */
    isMemoryGuardDisabled(): boolean;
    /**
     * Clear all CLI permission overrides
     */
    clear(): void;
}
//# sourceMappingURL=cli.d.ts.map