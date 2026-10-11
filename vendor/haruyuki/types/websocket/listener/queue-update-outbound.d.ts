import type { QueueRemovalTransition } from "../../types/queue-update-protocol";
import type { ListenerRuntime } from "./types";
export declare function scheduleQueueEmit(runtime: ListenerRuntime, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}, removed?: readonly QueueRemovalTransition[]): void;
//# sourceMappingURL=queue-update-outbound.d.ts.map