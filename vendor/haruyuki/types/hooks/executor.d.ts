import { type CommandHookConfig, type HookCommand, type HookExecutionResult, type HookInput, type HookResult } from "./types";
/**
 * Cap a model-facing hook string. Oversized text is saved to a file and
 * replaced with a short prefix plus the file path.
 *
 * Scrubbed for ambient runtime auth values first: hook children inherit the
 * runtime environment, and the overflow file path is shown to the model, so
 * both the excerpt and the persisted file must be credential-free.
 */
export declare function truncateHookFeedback(text: string, workingDirectory: string): string;
/**
 * Execute a single hook with JSON input
 * Dispatches to appropriate executor based on hook type:
 * - "command": executes shell command with JSON via stdin
 * - "prompt": sends to LLM for evaluation
 */
export declare function executeHookCommand(hook: HookCommand, input: HookInput, workingDirectory?: string): Promise<HookResult>;
/**
 * Execute a command hook with JSON input via stdin
 * Uses cross-platform shell launchers with fallback support
 */
export declare function executeCommandHook(hook: CommandHookConfig, input: HookInput, workingDirectory?: string): Promise<HookResult>;
/**
 * Execute multiple hooks sequentially and aggregate results
 * Stops early if any hook returns BLOCK (exit code 2)
 */
export declare function executeHooks(hooks: HookCommand[], input: HookInput, workingDirectory?: string): Promise<HookExecutionResult>;
/**
 * Execute hooks in parallel (for non-blocking hooks like PostToolUse)
 */
export declare function executeHooksParallel(hooks: HookCommand[], input: HookInput, workingDirectory?: string): Promise<HookExecutionResult>;
//# sourceMappingURL=executor.d.ts.map