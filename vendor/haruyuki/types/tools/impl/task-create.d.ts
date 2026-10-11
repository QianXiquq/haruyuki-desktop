import { type TaskRecord } from "./tasks/store.js";
interface TaskCreateArgs {
    subject?: string;
    description?: string;
    activeForm?: string;
    metadata?: Record<string, string>;
}
export declare function task_create(args: TaskCreateArgs): Promise<TaskRecord>;
export {};
//# sourceMappingURL=task-create.d.ts.map