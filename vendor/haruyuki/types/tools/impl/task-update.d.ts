import { type TaskRecord } from "./tasks/store.js";
interface TaskUpdateArgs {
    taskId?: string;
    status?: string;
    subject?: string;
    description?: string;
    activeForm?: string;
    owner?: string;
    addBlocks?: string[];
    addBlockedBy?: string[];
    metadata?: Record<string, unknown>;
}
export declare function task_update(args: TaskUpdateArgs): Promise<TaskRecord>;
export {};
//# sourceMappingURL=task-update.d.ts.map