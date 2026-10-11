import { addTask, deleteTask, listTasks } from "../../cron";
type WakeAction = "create" | "list" | "cancel";
interface WakeArgs {
    action: WakeAction;
    name?: string;
    prompt?: string;
    after_seconds?: number;
    scheduled_at?: string;
    cron?: string;
    id?: string;
    signal?: AbortSignal;
}
interface WakeDeps {
    now?: () => Date;
    addLocal?: typeof addTask;
    listLocal?: typeof listTasks;
    deleteLocal?: typeof deleteTask;
}
interface WakeResult {
    content: string;
    status: "success" | "error";
}
export declare function wake(args: WakeArgs, deps?: WakeDeps): Promise<WakeResult>;
export {};
//# sourceMappingURL=wake.d.ts.map