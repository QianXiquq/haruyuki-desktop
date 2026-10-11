import type { ConversationRuntime } from "./types";
export declare function resolveGitWorktreeAddTargetPath(command: string, cwd: string): string | null;
export declare function resolveGitWorktreeAddTargetPathFromLauncher(launcher: string[], cwd: string): string | null;
export declare function noteExpectedWorktreeForLauncher(launcher: string[], cwd: string): void;
export declare function hasExpectedWorktreePath(runtime: ConversationRuntime | null, detectedPath: string): boolean;
export declare function clearExpectedWorktreePath(runtime: ConversationRuntime | null): void;
export declare const __worktreeOwnershipTestUtils: {
    resolveGitWorktreeAddTargetPath: typeof resolveGitWorktreeAddTargetPath;
    resolveGitWorktreeAddTargetPathFromLauncher: typeof resolveGitWorktreeAddTargetPathFromLauncher;
};
//# sourceMappingURL=worktree-ownership.d.ts.map