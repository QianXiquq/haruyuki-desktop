import type { DeviceStatus } from "../../types/protocol_v2";
import type { ConversationRuntime } from "./types";
type DeviceToolsetStatus = Pick<DeviceStatus, "current_toolset" | "current_toolset_preference" | "available_toolsets">;
export declare function buildDeviceToolsetStatus(agentId: string | null, conversationId: string | null, conversationRuntime?: ConversationRuntime | null): DeviceToolsetStatus;
export {};
//# sourceMappingURL=device-toolset-status.d.ts.map