type ToolArgs = Record<string, unknown>;
/**
 * File-write tools (by canonical name) whose edits inside the agent's own
 * memory checkout are allowed like memory-dir shell commands. Codex writes
 * memory through ApplyPatch rather than Edit/Write.
 */
export declare const MEMORY_FILE_WRITE_TOOLS: Set<string>;
/**
 * True when every target of the write lies inside the agent's own memory
 * roots, both as written and after resolving symlinks (tolerating a
 * not-yet-existing leaf), so a link planted under the checkout cannot route
 * an auto-approved edit elsewhere. The cross-agent guard runs before this and
 * the MemFS pre-commit hook still protects read_only files.
 */
export declare function isOwnMemoryWrite(canonicalTool: string, toolArgs: ToolArgs, workingDirectory: string, agentId?: string): boolean;
export {};
//# sourceMappingURL=memory-write-allowance.d.ts.map