/**
 * Shell environment utilities
 * Provides enhanced environment variables for shell execution,
 * including bundled tools like ripgrep in PATH and Letta context for skill scripts.
 */
interface HaruyukiInvocation {
    command: string;
    args: string[];
}
export declare function resolveEntryScriptPath(scriptPath: string, cwd?: string): string;
export declare function resolveHaruyukiInvocation(env?: NodeJS.ProcessEnv, argv?: string[], execPath?: string, cwd?: string): HaruyukiInvocation | null;
export declare function getLettaShimDir(env?: NodeJS.ProcessEnv): string;
export declare function ensureLettaShimDir(invocation: HaruyukiInvocation, electronExecPath?: string | undefined): string | null;
/**
 * Get enhanced environment variables for shell execution.
 * Includes bundled tools (like ripgrep) in PATH and Letta context for skill scripts.
 */
export declare function getShellEnv(): NodeJS.ProcessEnv;
export {};
//# sourceMappingURL=shell-env.d.ts.map