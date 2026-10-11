interface ExitWorktreeResult {
    content: Array<{
        type: string;
        text: string;
    }>;
    status: "success" | "error";
    returned_to?: string;
    removed?: boolean;
}
/**
 * Leave the worktree this conversation is in and return to the primary
 * checkout, optionally deleting the worktree and its branch.
 *
 * Scope is the *current* working directory rather than a recorded session:
 * EnterWorktree can also switch into a worktree another conversation created,
 * and after a restart there is no in-memory session to consult. If the cwd is
 * not a managed worktree under `.haruyuki/worktrees/`, this is a no-op.
 */
export declare function exit_worktree(rawArgs: Record<string, unknown>): Promise<ExitWorktreeResult>;
export {};
//# sourceMappingURL=exit-worktree.d.ts.map