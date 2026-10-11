import type { DeviceStatus } from "../../types/protocol_v2";
import type { ListenerTransport } from "./transport";
type DeviceStatusScope = {
    agent_id?: string | null;
    conversation_id?: string | null;
};
export declare function recordDeviceStatus(transport: ListenerTransport, scope: DeviceStatusScope, status: DeviceStatus): void;
export declare function shouldEmitDeviceStatus(transport: ListenerTransport, scope: DeviceStatusScope, status: DeviceStatus, force?: boolean): boolean;
export {};
//# sourceMappingURL=device-status-cache.d.ts.map