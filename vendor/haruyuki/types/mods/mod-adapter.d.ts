import type { Backend } from "../backend";
import { type ModEvents } from "./event-emitter";
import { type CreateModEngineOptions, type ModEngine } from "./mod-engine";
import { type ModPermissionDefinition } from "./permission-registry";
import { type ModToolDefinition } from "./tool-registry";
import type { ModContext } from "./types";
export interface ModAdapterLoadState {
    hadModPanels: boolean;
    hasModSources: boolean;
    isLoading: boolean;
}
export interface ModAdapterSnapshot extends ModAdapterLoadState {
    registry: ReturnType<ModEngine["getSnapshot"]>;
}
export interface CreateModAdapterOptions extends CreateModEngineOptions {
    diagnosticsRootDirectory?: string;
    diagnosticsWriteDelayMs?: number;
    disabled?: boolean;
}
export interface ModAdapter {
    dispose: () => void;
    events: ModEvents;
    getAvailablePermissions: (context?: ModContext | null) => Map<string, ModPermissionDefinition>;
    getAvailableTools: (context?: ModContext | null) => Map<string, ModToolDefinition>;
    getBackend: () => Backend | undefined;
    getSnapshot: () => ModAdapterSnapshot;
    engine: ModEngine;
    reload: () => Promise<void>;
    subscribe: (listener: () => void) => () => void;
}
export declare function createModAdapter(options: CreateModAdapterOptions): ModAdapter;
//# sourceMappingURL=mod-adapter.d.ts.map