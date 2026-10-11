/**
 * Source of a skill (for display and override resolution)
 */
export type SkillSource = "bundled" | "global" | "agent" | "project";
export declare const ALL_SKILL_SOURCES: SkillSource[];
export type SkillSourceSpecifier = SkillSource | "all";
export type SkillSourceSelectionInput = {
    skillSourcesRaw?: string;
    noSkills?: boolean;
    noBundledSkills?: boolean;
};
export declare function isSkillSourceArray(value: unknown): value is SkillSource[];
export declare function parseSkillSourcesList(skillSourcesRaw: string): SkillSource[];
export declare function resolveSkillSourcesSelection(input: SkillSourceSelectionInput): SkillSource[];
//# sourceMappingURL=skill-sources.d.ts.map