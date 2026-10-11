import { type TaskRecord } from "./tasks/store.js";
interface TaskGetArgs {
    taskId?: string;
}
export declare function task_get(args: TaskGetArgs): Promise<TaskRecord>;
export {};
//# sourceMappingURL=task-get.d.ts.map