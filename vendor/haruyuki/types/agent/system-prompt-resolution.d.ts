/**
 * System prompt resolution that can fall back to subagent prompts.
 *
 * Split from `prompt-assets.ts` so that the preset content itself stays pure
 * (bundleable for the browser-safe `agent-presets` package export) while the
 * subagent lookup — which touches the filesystem/backend — lives here.
 */
import { type MemoryPromptMode } from "./prompt-assets";
/**
 * Validate a system prompt preset ID.
 *
 * Known preset IDs are always accepted. Subagent names are only accepted
 * when `allowSubagentNames` is true (internal subagent launches).
 *
 * @throws Error with a descriptive message listing valid options
 */
export declare function validateSystemPromptPreset(id: string, opts?: {
    allowSubagentNames?: boolean;
}): Promise<void>;
/**
 * Resolve a prompt ID and build the full system prompt for the memory mode.
 * Known presets are rebuilt deterministically. Unknown IDs (subagent names)
 * are resolved as complete prompts and are not modified.
 */
export declare function resolveAndBuildSystemPrompt(promptId: string | undefined, memoryMode: MemoryPromptMode): Promise<string>;
/**
 * Resolve a system prompt ID to its content.
 *
 * Resolution order:
 * 1. No input → default system prompt
 * 2. Known preset ID → preset content
 * 3. Subagent name → subagent's system prompt
 * 4. Unknown → throws (callers should validate first via validateSystemPromptPreset)
 *
 * @param systemPromptPreset - The system prompt preset (e.g., "letta", "source-claude") or subagent name (e.g., "recall")
 * @returns The resolved system prompt content
 * @throws Error if the ID doesn't match any preset or subagent
 */
export declare function resolveSystemPrompt(systemPromptPreset: string | undefined): Promise<string>;
//# sourceMappingURL=system-prompt-resolution.d.ts.map