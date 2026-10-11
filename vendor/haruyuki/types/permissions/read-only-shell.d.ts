export declare const SAFE_GIT_SUBCOMMAND_LIST: readonly ["status", "diff", "log", "show", "grep", "branch", "tag", "remote", "rev-parse", "ls-files", "ls-tree", "cat-file", "describe", "blame", "shortlog", "name-rev", "rev-list", "for-each-ref", "count-objects", "verify-commit", "verify-tag"];
export declare const SAFE_GH_COMMANDS: Record<string, Set<string> | null>;
export interface ReadOnlyShellOptions {
    allowExternalPaths?: boolean;
    allowedPathRoots?: string[];
}
export declare function isReadOnlyShellCommand(command: string | string[] | undefined | null, options?: ReadOnlyShellOptions): boolean;
type ScopedShellOptions = {
    env?: NodeJS.ProcessEnv;
    workingDirectory?: string;
};
export declare function isScopedMemoryShellCommand(command: string | string[] | undefined | null, allowedRoots: string[], options?: ScopedShellOptions): boolean;
/**
 * Check if a shell command exclusively targets the agent's memory directory.
 */
export declare function isMemoryDirCommand(command: string | string[] | undefined | null, agentId: string): boolean;
export {};
//# sourceMappingURL=read-only-shell.d.ts.map