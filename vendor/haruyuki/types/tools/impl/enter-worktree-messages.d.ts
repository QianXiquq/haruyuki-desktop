export interface ProjectInstructions {
    content: string;
    truncated: boolean;
}
export declare function readProjectInstructions(worktreePath: string): Promise<ProjectInstructions | null>;
export declare function buildCreatedWorktreeMessage(params: {
    worktreePath: string;
    branchName: string;
    baseRef: string;
    switchedCwd: boolean;
    provisionNotes: string[];
    linkedDependencies: boolean;
    projectInstructions: ProjectInstructions | null;
}): string;
export declare function buildEnteredWorktreeMessage(params: {
    worktreePath: string;
    branchName?: string;
    switchedCwd: boolean;
    lockNote?: string;
    projectInstructions: ProjectInstructions | null;
}): string;
//# sourceMappingURL=enter-worktree-messages.d.ts.map