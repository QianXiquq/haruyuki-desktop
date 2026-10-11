export interface ResolveAllowedMemoryRootsOptions {
    env?: NodeJS.ProcessEnv;
    currentAgentId?: string | null;
    parentAgentId?: string | null;
    homeDir?: string;
}
export interface ResolvedMemoryRoots {
    roots: string[];
    primaryRoot: string | null;
    usedFallback: boolean;
}
export declare function normalizeMemoryPath(path: string): string;
export declare function expandHomePath(path: string): string;
export declare function resolveMemoryTargetPath(targetPath: string, workingDirectory: string): string | null;
export declare function isPathWithinRoots(path: string, roots: string[]): boolean;
/**
 * Resolve the current agent ID from: (1) the explicit argument, (2) the
 * `AGENT_ID` / `HARUYUKI_AGENT_ID` env vars, or (3) the in-process agent
 * context. Returns null when none of those sources yields a non-empty ID.
 */
export declare function deriveAgentId(env: NodeJS.ProcessEnv, explicitAgentId?: string | null): string | null;
export declare function resolveAllowedMemoryRoots(options?: ResolveAllowedMemoryRootsOptions): ResolvedMemoryRoots;
//# sourceMappingURL=memory-paths.d.ts.map