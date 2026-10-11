/**
 * Pure personality preset definitions and content builders.
 *
 * This module must stay free of Node/backend imports: it is bundled into the
 * browser-safe `@letta-ai/letta-code/agent-presets` package export so that
 * other surfaces (e.g. the chat web app) can build byte-identical agent
 * creation payloads. Filesystem application of personalities lives in
 * `personality.ts`.
 */
export type PersonalityAssetId = "tutor-profile";
export interface PersonalityDefaultMemoryFile {
    path: string;
    assetId: PersonalityAssetId;
    commitMessage: string;
}
export interface PersonalityOption {
    id: "blank" | "kawaii" | "codex" | "claude" | "linus" | "memo" | "tutorial";
    label: string;
    description: string;
    /** Model ID or handle to use when no explicit model is provided. */
    defaultModel?: string;
    /** Binary files seeded into MemFS after the initial checkout. */
    defaultMemoryFiles?: readonly PersonalityDefaultMemoryFile[];
}
export declare const PERSONALITY_OPTIONS: PersonalityOption[];
export type PersonalityId = PersonalityOption["id"];
export type PersonalityEnvironment = "cloud" | "local";
export declare const PERSONALITY_TAG_PREFIX = "personality:";
export declare function buildPersonalityTag(personalityId: PersonalityId): string;
export declare function getPersonalityCreationTags(personalityId: PersonalityId): string[];
export declare function resolvePersonalityIdFromTags(tags: readonly string[] | null | undefined): PersonalityId | null;
export declare const DEFAULT_CREATE_AGENT_PERSONALITIES: readonly ["memo", "tutorial", "blank", "linus", "kawaii"];
export type DefaultCreateAgentPersonalityId = (typeof DEFAULT_CREATE_AGENT_PERSONALITIES)[number];
/** Preset ids, in `PERSONALITY_OPTIONS` order — the list help text should print. */
export declare const PERSONALITY_ID_LIST: string;
export interface PersonalityBlockDefinition {
    value: string;
    description?: string;
    templatePromptAssetName: string;
}
export declare const ONBOARDING_PERSONALITIES: readonly ["tutorial"];
export declare function supportsOnboardingBlock(personalityId: PersonalityId): personalityId is (typeof ONBOARDING_PERSONALITIES)[number];
export declare const FRONTMATTER_REGEX: RegExp;
export declare function normalizeComparableContent(content: string): string;
export declare function serializeFrontmatter(frontmatter: Record<string, string>): string;
export declare function buildDefaultMemoryFile(templatePromptAssetName: string, body: string, description?: string, options?: {
    name?: string;
}): string;
export declare function getPersonalityOption(personalityId: PersonalityId): PersonalityOption;
export declare function getPersonalityDefaultMemoryFiles(personalityId: PersonalityId): readonly PersonalityDefaultMemoryFile[];
export declare function resolvePersonalityId(input: string): PersonalityId | null;
export declare function getPersonalityContent(personalityId: PersonalityId): string;
export declare function getDefaultHumanContent(): string;
export declare function getPersonalityHumanContent(personalityId: PersonalityId): string;
export declare function getPersonalityBlockValues(personalityId: PersonalityId): {
    persona: string;
    human: string;
};
export declare function getPersonalityBlockDefinitions(personalityId: PersonalityId, environment?: PersonalityEnvironment): {
    persona: PersonalityBlockDefinition;
    human: PersonalityBlockDefinition;
    onboarding?: PersonalityBlockDefinition;
};
export interface PersonalityMemoryBlock {
    label: string;
    value: string;
    description?: string;
}
/**
 * Build the memory blocks a new agent gets for a personality: the default
 * blocks with persona/human values replaced by the personality's content,
 * plus the onboarding block for personalities that support it.
 *
 * Shared by the CLI create path (`buildCreateAgentOptionsForPersonality`) and
 * the exported wire payload builder (`buildCreateAgentRequestForPersonality`).
 */
export declare function buildPersonalityMemoryBlocks(personalityId: PersonalityId, defaultMemoryBlocks: Array<{
    label: string;
    value: string;
    description?: string | null;
}>, environment?: PersonalityEnvironment): PersonalityMemoryBlock[];
//# sourceMappingURL=personality-presets.d.ts.map