import type { AttachedAgentRepository } from "../../agent/attached-repositories";
interface SkillArgs {
    skill: string;
    /** Injected by executeTool - the tool_call_id for this invocation */
    toolCallId?: string;
    /** Injected by executeTool in listener mode for scoped agent resolution. */
    parentScope?: {
        agentId: string;
        conversationId: string;
    };
}
interface SkillResult {
    message: string;
}
export interface ReadSkillContentOptions {
    attachedRepositories?: readonly AttachedAgentRepository[];
}
/**
 * Read skill content from file or bundled source
 * Returns both content and the path to the SKILL.md file
 *
 * Search order (highest priority first):
 * 1. Project skills (.agents/skills/, then legacy .skills/ fallback)
 * 2. Agent memory skills (~/.haruyuki/agents/{id}/memory/skills/)
 * 3. Agent memory skills fallback ($MEMORY_DIR/skills/)
 * 4. Attached shared-memory skills
 * 5. Global skills (~/.haruyuki/skills/)
 * 6. Bundled skills
 */
export declare function readSkillContent(skillId: string, skillsDir: string, agentId?: string, options?: ReadSkillContentOptions): Promise<{
    content: string;
    path: string;
}>;
/**
 * Get skills directory, trying multiple sources
 */
export declare function getResolvedSkillsDir(): Promise<string>;
export interface RenderSkillContentOptions {
    allowDisabledModelInvocation?: boolean;
}
export declare function renderSkillContent(skillName: string, skillContent: string, skillPath: string, options?: RenderSkillContentOptions): string;
export declare function loadRenderedSkillContent(skillName: string, options?: RenderSkillContentOptions & ReadSkillContentOptions & {
    agentId?: string;
    skillsDir?: string;
}): Promise<string>;
export declare function wrapSkillContent(skillName: string, content: string): string;
export declare function wrapSkillPrompt(skillName: string, content: string, userRequest: string): string;
export declare function skill(args: SkillArgs, dependencies?: ReadSkillContentOptions): Promise<SkillResult>;
export {};
//# sourceMappingURL=skill.d.ts.map