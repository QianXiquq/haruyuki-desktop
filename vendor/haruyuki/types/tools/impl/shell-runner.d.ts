import { type ShellSourceCommand } from "./github-pull-request-tracker.js";
export declare class ShellExecutionError extends Error {
    code?: string;
    executable?: string;
    cwd?: string;
    /** Distinguishes which lookup failed when `code` is ENOENT. */
    reason?: "executable_missing" | "cwd_missing";
}
export type ShellOutputStream = "stdout" | "stderr";
export type ShellSpawnOptions = {
    cwd: string;
    env: NodeJS.ProcessEnv;
    timeoutMs: number;
    /** Command before launcher and sandbox wrapping, used for completion metadata. */
    sourceCommand?: ShellSourceCommand;
    signal?: AbortSignal;
    onOutput?: (chunk: string, stream: ShellOutputStream) => void;
    tty?: boolean;
    /** Disable when the caller already keeps its own bounded output buffer. */
    captureOutput?: boolean;
};
export interface ShellProcessHandle {
    kill(signal?: string | number): unknown;
    interrupt(): void;
    write(input: string): void;
}
export interface ShellProcessResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
}
export interface RunningShellProcess {
    process: ShellProcessHandle;
    completion: Promise<ShellProcessResult>;
    terminate(): void;
}
/**
 * Starts one shell process. Every built-in shell surface uses this function,
 * while its adapter decides whether to await completion or expose a session.
 */
export declare function startShellProcess(launcher: string[], options: ShellSpawnOptions): RunningShellProcess;
/**
 * Compatibility helper for callers that wait for the process to finish.
 */
export declare function spawnWithLauncher(launcher: string[], options: ShellSpawnOptions): Promise<ShellProcessResult>;
//# sourceMappingURL=shell-runner.d.ts.map