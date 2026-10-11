import type { SandboxAvailability } from "../sandbox/availability";
import { type SandboxBackend } from "../sandbox/policy";
export interface MemoryConfinementLauncherInput {
    /** Command and arguments for the process that should be confined. */
    launcher: string[];
    /**
     * Environment for the confined process. `MEMORY_DIR` (or
     * `LETTA_MEMORY_DIR`) identifies the memory root that stays writable.
     */
    env: NodeJS.ProcessEnv;
}
export interface MemoryConfinementLauncherResult {
    /** Sandbox wrapper followed by the original launcher. */
    launcher: string[];
    /** Original environment plus the nested-sandbox sentinel. */
    env: NodeJS.ProcessEnv;
    backend: SandboxBackend;
}
export declare function createMemoryConfinementLauncherWithAvailability(input: MemoryConfinementLauncherInput, availability: SandboxAvailability): MemoryConfinementLauncherResult;
//# sourceMappingURL=memory-confinement-launcher.d.ts.map