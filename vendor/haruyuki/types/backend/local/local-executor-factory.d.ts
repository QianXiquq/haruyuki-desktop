import { type HeadlessTurnExecutor } from "../dev/headless-turn-executor";
import type { LocalPiModelsRuntime } from "../dev/pi-models-runtime";
import { type PiStreamFunction } from "../dev/pi-stream-adapter";
import type { LlmEndInfo, LlmStartInfo } from "../dev/provider-turn-executor";
export type LocalBackendExecutionMode = "pi" | "deterministic" | "deterministic-reflection";
export interface CreateLocalExecutorOptions {
    storageDir: string;
    executionMode?: LocalBackendExecutionMode;
    executor?: HeadlessTurnExecutor;
    stream?: PiStreamFunction;
}
export declare function createLocalExecutor(options: CreateLocalExecutorOptions, modelsRuntime: LocalPiModelsRuntime, onLlmStart?: (info: LlmStartInfo) => void | Promise<void>, onLlmEnd?: (info: LlmEndInfo) => void | Promise<void>): HeadlessTurnExecutor;
//# sourceMappingURL=local-executor-factory.d.ts.map