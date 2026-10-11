/**
 * Agent memory block management
 * Loads memory blocks from .mdx files in src/agent/prompts
 */
import type { CreateBlock } from "@letta-ai/letta-client/resources/blocks/blocks";
import { READ_ONLY_BLOCK_LABELS } from "./memory-constants";
/**
 * The memory block labels every standard (non-MemFS) agent is created with.
 * Each maps to a `<label>.mdx` file in src/agent/prompts. Per-project blocks
 * (skills/loaded_skills) were removed in LET-7353 — skills are now injected
 * via system reminders, leaving only these defaults.
 */
export declare const MEMORY_BLOCK_LABELS: readonly ["persona", "human"];
/**
 * Block labels that should be read-only (agent cannot modify via memory tools).
 */
export { READ_ONLY_BLOCK_LABELS };
/**
 * Parse frontmatter and content from an .mdx file
 */
export declare function parseMdxFrontmatter(content: string): {
    frontmatter: Record<string, string>;
    body: string;
};
/**
 * Get default starter memory blocks for new agents
 */
export declare function getDefaultMemoryBlocks(): Promise<CreateBlock[]>;
//# sourceMappingURL=memory.d.ts.map