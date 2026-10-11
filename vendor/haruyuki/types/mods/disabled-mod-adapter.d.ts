import { type ModEvents } from "./event-emitter";
import type { LocalModRegistry, ModEngine } from "./mod-engine";
export declare function createDisabledModAdapter(): {
    dispose(): void;
    events: ModEvents;
    getAvailablePermissions(): Map<any, any>;
    getAvailableTools(): Map<any, any>;
    getBackend(): undefined;
    getSnapshot(): {
        hadModPanels: boolean;
        hasModSources: boolean;
        isLoading: boolean;
        registry: LocalModRegistry;
    };
    engine: ModEngine;
    reload(): Promise<void>;
    subscribe(_listener: () => void): () => undefined;
};
//# sourceMappingURL=disabled-mod-adapter.d.ts.map