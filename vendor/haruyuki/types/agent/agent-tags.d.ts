/**
 * Tags that identify Haruyuki agents and their capabilities.
 *
 * This module must stay free of Node/backend imports: it is bundled into the
 * browser-safe `@letta-ai/letta-code/agent-presets` package export.
 */
/** Marks an agent as created/managed by Haruyuki. */
export declare const HARUYUKI_CODE_ORIGIN_TAG = "origin:letta-code";
/** Marks an agent as created by a first-run onboarding flow. */
export declare const ONBOARDING_ORIGIN_TAG = "origin:onboarding";
/** Marks an agent as a Haruyuki subagent (excluded from prompt management). */
export declare const HARUYUKI_CODE_SUBAGENT_TAG = "role:subagent";
/** Marks an agent as using git-backed memory (MemFS). */
export declare const GIT_MEMORY_ENABLED_TAG = "git-memory-enabled";
export interface BuildCreatedAgentTagsOptions {
    tags?: string[] | null;
    isSubagent?: boolean;
    enableMemfs?: boolean;
}
export declare function buildCreatedAgentTags(options?: BuildCreatedAgentTagsOptions): string[];
//# sourceMappingURL=agent-tags.d.ts.map