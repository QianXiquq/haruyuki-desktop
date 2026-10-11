import { getRuntimeContext } from "../../runtime-context";
import { type WorktreeLockOwner } from "../../utils/worktree-lock";
interface EnterWorktreeResult {
    content: Array<{
        type: "text";
        text: string;
    }>;
    status: "success" | "error";
    worktree_path?: string;
    branch_name?: string;
    base_ref?: string;
    switched_cwd?: boolean;
}
/**
 * Provisions a freshly created worktree: symlinks heavy gitignored directories,
 * wires git hooks, copies local settings, and copies `.worktreeinclude` paths.
 * Every step is best-effort — failures are reported as notes and never abort
 * worktree creation.
 *
 * `symlinkDependencies` (opt-in; defaulted off at the tool layer) gates only
 * the dependency-directory symlinks. When true, node_modules is shared from the
 * primary checkout to avoid reinstalling — but a package install in the worktree
 * then writes through to the primary checkout, so worktrees stay isolated unless
 * it is explicitly requested. Returns `linkedDependencies` so the caller can
 * tailor its guidance.
 */
export declare function provisionWorktree(params: {
    primaryRoot: string;
    worktreePath: string;
    symlinkDependencies: boolean;
}): Promise<{
    notes: string[];
    linkedDependencies: boolean;
}>;
/**
 * Switches the active session/conversation working directory to `worktreePath`,
 * using the listener-aware path when a runtime is attached and falling back to
 * a plain process chdir otherwise. Shared by the create and enter flows.
 */
export declare function switchSessionToWorktree(params: {
    worktreePath: string;
    shouldSwitchCwd: boolean;
    runtimeContext: ReturnType<typeof getRuntimeContext>;
    executionContextId?: string;
}): Promise<boolean>;
/** Resolves the per-worktree git admin directory, or null if it cannot. */
export declare function resolveWorktreeGitDir(worktreePath: string): Promise<string | null>;
export declare function lockOwner(runtimeContext: ReturnType<typeof getRuntimeContext>): WorktreeLockOwner;
export declare function enter_worktree(rawArgs: Record<string, unknown>): Promise<EnterWorktreeResult>;
export {};
//# sourceMappingURL=enter-worktree.d.ts.map