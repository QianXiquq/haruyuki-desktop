/**
 * Conservative startup-context budgeting for subagents.
 *
 * We intentionally avoid tokenizer dependencies here. The estimate is used only
 * as a safety guard before sending prompts to the API; using 4 chars/token is
 * conservative enough for English/Markdown prompts while keeping the codepath
 * synchronous and dependency-free.
 */
import type { SubagentConfig } from ".";
export declare const STARTUP_CONTEXT_ESTIMATED_CHARS_PER_TOKEN = 4;
export declare const REFLECTION_STARTUP_CONTEXT_TOKEN_LIMIT = 16000;
export declare const REFLECTION_STARTUP_CONTEXT_CHAR_LIMIT: number;
export declare const REFLECTION_PARENT_MEMORY_SNAPSHOT_CHAR_LIMIT = 40000;
export declare function estimateStartupContextTokens(text: string): number;
export declare function buildSubagentPrompt(type: string, config: SubagentConfig, userPrompt: string): string;
//# sourceMappingURL=context-budget.d.ts.map