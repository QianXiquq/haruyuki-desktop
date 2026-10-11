import type { AgentState } from "@letta-ai/letta-client/resources/agents/agents";
import type { SkillSource } from "../agent/skill-sources";
import type { ModEvents } from "../mods/event-emitter";
import type { ModAdapter } from "../mods/mod-adapter";
import type { ModContext } from "../mods/types";
import type { RuntimeContextSnapshot } from "../runtime-context";
import { type PreparedToolExecutionContext } from "./manager";
import type { PermissionModeState } from "./permission-mode-state";
import { type ToolName } from "./tool-definitions";
import type { ToolsetName, ToolsetPreference } from "./toolset-types";
export type { ToolsetName, ToolsetPreference } from "./toolset-types";
export interface ClientToolsetConfig {
    /** Request-scoped base toolset. Omitted preserves the runtime preference. */
    base?: ToolsetPreference;
    /** Additional bundled client tools to load before applying the allowlist. */
    include?: string[];
}
export declare function deriveToolsetFromModel(modelIdentifier: string, providerType?: string | null, options?: {
    openAICompatibleProxy?: boolean | null;
}): "codex" | "default";
/** Startup uses the same preset selection and construction as each turn. */
export declare function loadStartupTools(params: {
    modelIdentifier?: string;
    toolset?: ToolsetPreference;
    exclude?: ToolName[];
}): Promise<void>;
export type PreparedScopeToolContext = {
    preparedToolContext: PreparedToolExecutionContext;
    toolset: ToolsetName;
    toolsetPreference: ToolsetPreference;
    effectiveModel: string | null;
    agent: AgentState | null;
};
export declare function prepareToolExecutionContextForResolvedTarget(params: {
    modelIdentifier?: string | null;
    providerType?: string | null;
    openAICompatibleProxy?: boolean | null;
    conversationId?: string | null;
    toolsetPreference: ToolsetPreference;
    clientToolset?: ClientToolsetConfig;
    exclude?: ToolName[];
    clientToolAllowlist?: string[];
    externalToolScopeIds?: string[];
    workingDirectory?: string;
    permissionModeState?: PermissionModeState;
    modContext?: ModContext;
    modEvents?: ModEvents;
    modAdapters?: ModAdapter[];
    runtimeContext?: Partial<RuntimeContextSnapshot>;
    agent?: AgentState | null;
}): Promise<PreparedScopeToolContext>;
export declare function prepareToolExecutionContextForScope(params: {
    connectionId?: string;
    environmentDeviceId?: string;
    agentId: string | null;
    conversationId?: string | null;
    overrideModel?: string | null;
    overrideProviderType?: string | null;
    cachedEffectiveModel?: string | null;
    exclude?: ToolName[];
    clientToolset?: ClientToolsetConfig;
    clientToolAllowlist?: string[];
    externalToolScopeIds?: string[];
    workingDirectory?: string;
    permissionModeState?: PermissionModeState;
    skillsDirectory?: string;
    skillSources?: SkillSource[];
    workspaceSandbox?: RuntimeContextSnapshot["workspaceSandbox"];
    executionSettings?: RuntimeContextSnapshot["executionSettings"];
    cachedAgent?: AgentState | null;
    modContext?: ModContext;
    modEvents?: ModEvents;
    modAdapters?: ModAdapter[];
}): Promise<PreparedScopeToolContext>;
type PersistedToolRule = NonNullable<AgentState["tool_rules"]>[number];
interface AgentWithToolsAndRules {
    tags?: string[] | null;
    tool_rules?: PersistedToolRule[];
}
export declare function shouldClearPersistedToolRules(agent: AgentWithToolsAndRules): boolean;
export declare function clearPersistedClientToolRules(agentId: string, cachedAgent?: AgentState | null): Promise<{
    removedToolNames: string[];
} | null>;
/**
 * Force switch to a specific toolset regardless of model.
 *
 * @param toolsetName - The toolset to switch to
 */
export declare function forceToolsetSwitch(toolsetName: ToolsetName): Promise<void>;
/**
 * Switches the loaded toolset based on the target model identifier.
 *
 * @param modelIdentifier - The model handle/id
 * @param providerType - Provider type used to refine toolset derivation
 */
export declare function switchToolsetForModel(modelIdentifier: string, providerType?: string | null): Promise<ToolsetName>;
//# sourceMappingURL=toolset.d.ts.map