import { type MemoryConfinementLauncherInput, type MemoryConfinementLauncherResult } from "./permissions/memory-confinement-launcher";
export type { MemoryConfinementLauncherInput, MemoryConfinementLauncherResult, } from "./permissions/memory-confinement-launcher";
/**
 * Wrap a process in the same fail-closed filesystem policy used by Haruyuki's unattended memory subagents.
 *
 * The process can read the host broadly, write harness state and its own
 * memory, and cannot read or write other agents' memory. Throws when no
 * supported kernel sandbox is available rather than silently running with a
 * weaker policy.
 */
export declare function createMemoryConfinementLauncher(input: MemoryConfinementLauncherInput): MemoryConfinementLauncherResult;
//# sourceMappingURL=memory-confinement.d.ts.map