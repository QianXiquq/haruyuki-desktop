import { type HookInput, type HookResult, type PromptHookConfig } from "./types";
/**
 * Execute a prompt-based hook by sending the hook input to an LLM
 * via the POST /v1/agents/{agent_id}/generate endpoint.
 */
export declare function executePromptHook(hook: PromptHookConfig, input: HookInput, _workingDirectory?: string): Promise<HookResult>;
//# sourceMappingURL=prompt-executor.d.ts.map