export type ReflectionTrigger = "off" | "step-count" | "compaction-event";
export type ReflectionMergeMode = "auto" | "explicit";
/** Host policy, independent of saved trigger settings. Manual reflection is unaffected. */
export declare function isAutoReflectionEnabled(): boolean;
export interface StoredReflectionSettings {
    trigger: ReflectionTrigger;
    stepCount: number;
    merge?: ReflectionMergeMode;
    mergeInstructions?: string;
}
//# sourceMappingURL=reflection-settings.d.ts.map