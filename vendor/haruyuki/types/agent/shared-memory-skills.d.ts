import type { AttachedAgentRepository } from "./attached-repositories";
import { type SkillDiscoveryError, type SkillDiscoveryResult, type SkillSource } from "./skills";
export declare function invalidateAttachedRepositoriesCache(agentId?: string): void;
export interface SharedMemorySkillsContext {
    skillsDirs: string[];
    errors: SkillDiscoveryError[];
}
/**
 * Resolve only server-attached repository mounts. Local sibling directories are
 * deliberately ignored because detach leaves their checkouts on disk.
 */
export declare function resolveSharedMemorySkillsContext(options: {
    agentId?: string;
    skillSources: SkillSource[];
    attachedRepositories?: readonly AttachedAgentRepository[];
}): Promise<SharedMemorySkillsContext>;
export declare function discoverSharedMemorySkills(skillsDirs: string[]): Promise<SkillDiscoveryResult>;
//# sourceMappingURL=shared-memory-skills.d.ts.map