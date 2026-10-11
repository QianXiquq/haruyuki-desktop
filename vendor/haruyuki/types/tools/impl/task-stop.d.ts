interface TaskStopArgs {
    task_id: string;
}
interface TaskStopResult {
    killed: boolean;
}
export declare function task_stop(args: TaskStopArgs): Promise<TaskStopResult>;
export {};
//# sourceMappingURL=task-stop.d.ts.map