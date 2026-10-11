/**
 * Get the first working shell launcher for background processes.
 * Uses cached launcher if available, otherwise returns first launcher from buildShellLaunchers.
 * For background processes, we can't easily do async fallback, so we rely on cached launcher
 * from previous foreground commands or the default launcher order.
 */
export declare function getBackgroundLauncher(command: string, env: NodeJS.ProcessEnv, secretEnv?: Record<string, string>): string[];
/**
 * Execute a command using spawn with explicit shell.
 * This avoids the double-shell parsing that exec() does.
 * Uses buildShellLaunchers() to try multiple shells with ENOENT fallback.
 * Exported for use by bash mode in the CLI.
 */
export declare function spawnCommand(command: string, options: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    timeout: number;
    signal?: AbortSignal;
    onOutput?: (chunk: string, stream: "stdout" | "stderr") => void;
    secretEnv?: Record<string, string>;
}): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
}>;
interface BashArgs {
    command: string;
    timeout?: number;
    description?: string;
    run_in_background?: boolean;
    signal?: AbortSignal;
    onOutput?: (chunk: string, stream: "stdout" | "stderr") => void;
    secretEnv?: Record<string, string>;
    parentScope?: {
        agentId: string;
        conversationId: string;
    };
    /** Test-only override; not exposed in the Bash tool schema. */
    foregroundYieldMs?: number;
}
interface BashResult {
    content: Array<{
        type: string;
        text: string;
    }>;
    status: "success" | "error";
}
export declare function bash(args: BashArgs): Promise<BashResult>;
export {};
//# sourceMappingURL=bash.d.ts.map