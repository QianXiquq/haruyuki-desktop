import type { ExperimentId, ExperimentSnapshot } from "./types";
declare class ExperimentManager {
    private getStoredOverrides;
    list(): ExperimentSnapshot[];
    getSnapshot(id: ExperimentId): ExperimentSnapshot;
    isEnabled(id: ExperimentId): boolean;
    set(id: ExperimentId, enabled: boolean): ExperimentSnapshot;
    toggle(id: ExperimentId): ExperimentSnapshot;
}
export declare const experimentManager: ExperimentManager;
export {};
//# sourceMappingURL=manager.d.ts.map