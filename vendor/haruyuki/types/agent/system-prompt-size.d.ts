/**
 * Shared system-prompt size estimator.
 *
 * Used by:
 *   - The `haruyuki memory tokens` CLI command (for subagents + scripts)
 *   - The startup system-prompt warning
 *   - The bundled `context-doctor` skill script (via CLI)
 *
 * Heuristic: ~4 bytes per token
 * (codex-rs/core/src/truncate.rs APPROX_BYTES_PER_TOKEN = 4)
 */
export declare const SYSTEM_PROMPT_BYTES_PER_TOKEN = 4;
export interface FileEstimate {
    path: string;
    tokens: number;
}
export interface SystemPromptSizeEstimate {
    total: number;
    files: FileEstimate[];
}
export declare function estimateSystemTokens(text: string): number;
/**
 * Estimate total token usage of core memory Markdown, with a per-file breakdown.
 *
 * MemFS v1 counts Markdown files recursively under `system/`. MemFS v2 counts
 * root-level Markdown files. A root `MEMORY.md` selects v2 only for API-backed
 * memory; local MemFS remains v1.
 *
 * Returns { total: 0, files: [] } when the core memory path does not exist.
 */
export declare function estimateSystemPromptSize(memoryDir: string, localMemfs?: boolean): SystemPromptSizeEstimate;
/**
 * Backward-compatible helper returning just the total.
 */
export declare function estimateSystemPromptTokensFromMemoryDir(memoryDir: string, localMemfs?: boolean): number;
//# sourceMappingURL=system-prompt-size.d.ts.map