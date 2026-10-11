/** Keep the snapshot only for the lifetime of the child that can read it. */
export declare function withMemoryHandoff<T>(params: Parameters<typeof prepareMemoryHandoff>[0], run: (handoff: Awaited<ReturnType<typeof prepareMemoryHandoff>>) => Promise<T>): Promise<T>;
/** Fresh workers receive the assignment, with parent history available only on demand. */
export declare function prepareMemoryHandoff(params: {
    agentId: string;
    conversationId: string;
    memoryDir: string;
    assignment: string;
    repairOnly?: boolean;
    /** Cancelling the task must also stop a slow export, not just the child. */
    signal?: AbortSignal;
}): Promise<{
    prompt: string;
    transcriptPath?: string;
}>;
//# sourceMappingURL=memory-handoff.d.ts.map