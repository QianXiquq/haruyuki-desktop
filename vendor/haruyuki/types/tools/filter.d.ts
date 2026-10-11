/**
 * Tool filter manager to control which tools are enabled for the session.
 * Set via CLI --tools flag.
 */
declare class ToolFilterManager {
    private enabledTools;
    /**
     * Set which tools are enabled for this session
     * @param toolsString - Comma-separated list of tool names, or empty string for no tools
     */
    setEnabledTools(toolsString: string): void;
    /**
     * Get list of enabled tools (null means all tools)
     */
    getEnabledTools(): string[] | null;
    /**
     * Reset to default (all tools enabled)
     */
    reset(): void;
}
export declare const toolFilter: ToolFilterManager;
export {};
//# sourceMappingURL=filter.d.ts.map