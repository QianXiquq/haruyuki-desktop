import { type ChildProcessWithoutNullStreams } from "node:child_process";
export interface SubagentProcessExit {
    exitCode: number | null;
    exitSignal: NodeJS.Signals | null;
}
interface SpawnSubagentProcessOptions {
    cwd: string;
    env: NodeJS.ProcessEnv;
    signal?: AbortSignal;
    forceKillGraceMs?: number;
}
export interface RunningSubagentProcess {
    process: ChildProcessWithoutNullStreams;
    completion: Promise<SubagentProcessExit>;
    wasAborted(): boolean;
}
/**
 * Spawns one local subagent in its own process group and ties cancellation to
 * the full group instead of only the headless launcher PID.
 */
export declare function spawnSubagentProcess(command: string, args: string[], options: SpawnSubagentProcessOptions): RunningSubagentProcess;
export {};
//# sourceMappingURL=subagent-process.d.ts.map