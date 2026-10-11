import type { MessageCreateParams as ConversationMessageCreateParams } from "@letta-ai/letta-client/resources/conversations/messages";
import type { AvailableSkillSummary } from "../types/protocol_v2";
import type { AttachedAgentRepository } from "./attached-repositories";
import { discoverSkills, type SkillDiscoveryError, type SkillDiscoveryResult, type SkillSource } from "./skills";
/**
 * Invalidate the entire client skills payload cache.
 *
 * Useful when the process-wide skill configuration changes
 * (e.g. cwd switch, env var change, or global skill source update).
 */
export declare function invalidateClientSkillsPayloadCache(): void;
/**
 * Invalidate cache entries for a specific agent.
 *
 * Useful when an agent's memory skills are updated (e.g. skill
 * creation/deletion via the Skill tool) and the next
 * `sendMessageStream` call must re-discover.
 */
export declare function invalidateClientSkillsPayloadCacheForAgent(agentId: string): void;
/** Metadata-only reminder for changes since a conversation's last accepted send. */
export declare function buildClientSkillsUpdateReminder(previous: BuildClientSkillsPayloadResult["clientSkills"] | undefined, current: BuildClientSkillsPayloadResult["clientSkills"]): string | null;
export type ClientSkill = NonNullable<ConversationMessageCreateParams["client_skills"]>[number];
export interface BuildClientSkillsPayloadOptions {
    agentId?: string;
    workingDirectory?: string;
    skillsDirectory?: string | null;
    skillSources?: SkillSource[];
    attachedRepositories?: readonly AttachedAgentRepository[];
    discoverSkillsFn?: typeof discoverSkills;
    logger?: (message: string) => void;
}
export interface BuildClientSkillsPayloadResult {
    clientSkills: NonNullable<ConversationMessageCreateParams["client_skills"]>;
    availableSkills: AvailableSkillSummary[];
    skillPathById: Record<string, string>;
    errors: SkillDiscoveryError[];
}
export interface DiscoverClientSideSkillsOptions {
    agentId?: string;
    workingDirectory?: string;
    skillsDirectory?: string | null;
    skillSources?: SkillSource[];
    attachedRepositories?: readonly AttachedAgentRepository[];
    discoverSkillsFn?: typeof discoverSkills;
}
/**
 * Discover all client-side skills from the same roots used for `client_skills`.
 * This intentionally returns both model-invocable and manual-only skills; callers
 * decide whether to filter for model invocation or slash-command invocation.
 */
export declare function discoverClientSideSkills(options?: DiscoverClientSideSkillsOptions): Promise<SkillDiscoveryResult>;
/**
 * Build `client_skills` payload for conversations.messages.create.
 *
 * This discovers client-side skills using the same source selection rules as the
 * Skill tool and headless startup flow, then converts them into the server-facing
 * schema expected by the API. Ordering is deterministic by skill id.
 *
 * Results are cached in-memory keyed by agent id, skill sources, cwd, and
 * resolved skill roots so that repeated calls (e.g. during approval
 * continuations) skip redundant filesystem discovery.
 */
export declare function buildClientSkillsPayload(options?: BuildClientSkillsPayloadOptions): Promise<BuildClientSkillsPayloadResult>;
//# sourceMappingURL=client-skills.d.ts.map