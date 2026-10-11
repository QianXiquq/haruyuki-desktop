/**
 * In-memory task store backing the Task* CRUD family.
 *
 * This powers TaskCreate / TaskGet / TaskList / TaskUpdate — the replacement
 * for the older stateless `TodoWrite` tool. Tasks have stable IDs, dependency
 * edges (blocks/blockedBy), optional owner, and a free-form metadata bag.
 *
 * Scope: process-lifetime. Same model as `process_manager.ts`'s background
 * task registry. A future follow-up may scope per-conversation.
 */
export type TaskStatus = "pending" | "in_progress" | "completed" | "deleted";
export interface TaskRecord {
    taskId: string;
    subject: string;
    description: string;
    activeForm?: string;
    status: TaskStatus;
    owner?: string;
    /** IDs of tasks this task blocks (i.e. those tasks can't start until this one finishes) */
    blocks: string[];
    /** IDs of tasks that block this task */
    blockedBy: string[];
    metadata: Record<string, unknown>;
    createdAt: number;
    updatedAt: number;
}
export interface CreateTaskInput {
    subject: string;
    description: string;
    activeForm?: string;
    metadata?: Record<string, string>;
}
export declare function createTask(input: CreateTaskInput): TaskRecord;
export declare function getTask(taskId: string): TaskRecord | undefined;
export declare function listTasks(): TaskRecord[];
export interface UpdateTaskInput {
    taskId: string;
    status?: TaskStatus;
    subject?: string;
    description?: string;
    activeForm?: string;
    owner?: string;
    addBlocks?: string[];
    addBlockedBy?: string[];
    metadata?: Record<string, unknown>;
}
export declare class TaskNotFoundError extends Error {
    constructor(taskId: string);
}
export declare function updateTask(input: UpdateTaskInput): TaskRecord;
/** Test-only hook to reset state between unit tests. */
export declare function _resetTaskStoreForTests(): void;
//# sourceMappingURL=store.d.ts.map