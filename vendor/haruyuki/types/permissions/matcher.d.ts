export interface MatcherOptions {
    canonicalizeToolNames?: boolean;
    allowBareToolFallback?: boolean;
}
/**
 * Check if a file path matches a permission pattern.
 *
 * Patterns follow Claude Code's glob syntax:
 * - "Read(file.txt)" - exact match in working directory
 * - "Read(*.txt)" - glob pattern
 * - "Read(src/**)" - recursive glob
 * - "Read(//absolute/path/**)" - absolute path pattern
 * - "Read(~/.zshrc)" - tilde expansion
 *
 * @param query - The query to check (e.g., "Read(.env)")
 * @param pattern - The permission pattern (e.g., "Read(src/**)")
 * @param workingDirectory - Current working directory
 */
export declare function matchesFilePattern(query: string, pattern: string, workingDirectory: string, options?: MatcherOptions): boolean;
/**
 * Check if a bash command matches a permission pattern.
 *
 * Bash patterns use PREFIX matching, not regex:
 * - "Bash(git diff:*)" matches "Bash(git diff ...)", "Bash(git diff HEAD)", etc.
 * - "Bash(npm run lint)" matches exactly "Bash(npm run lint)"
 * - The :* syntax is a special wildcard for "this command and any args"
 *
 * @param query - The bash query to check (e.g., "Bash(git diff HEAD)")
 * @param pattern - The permission pattern (e.g., "Bash(git diff:*)")
 */
export declare function matchesBashPattern(query: string, pattern: string, options?: MatcherOptions): boolean;
/**
 * Check if a tool name matches a permission pattern.
 *
 * For non-file tools, we match by tool name:
 * - "WebFetch" matches all WebFetch calls
 * - "*" matches all tools
 *
 * @param toolName - The tool name
 * @param pattern - The permission pattern
 */
export declare function matchesToolPattern(toolName: string, pattern: string, options?: MatcherOptions): boolean;
//# sourceMappingURL=matcher.d.ts.map