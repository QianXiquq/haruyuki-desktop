import type { ReflectionMergeMode, ReflectionTrigger } from "../../reflection-settings";
export type { ReflectionMergeMode, ReflectionTrigger, } from "../../reflection-settings";
export type MemoryReminderMode = number | null | "compaction" | "auto-compaction";
export interface ReflectionSettings {
    trigger: ReflectionTrigger;
    stepCount: number;
    merge?: ReflectionMergeMode;
    mergeInstructions?: string;
}
export interface ResolvedReflectionSettings extends ReflectionSettings {
    merge: ReflectionMergeMode;
    mergeInstructions: string;
}
export declare function reflectionSettingsToLegacyMode(settings: ReflectionSettings): MemoryReminderMode;
/**
 * Get effective reflection settings (local overrides global with legacy fallback).
 */
export declare function getReflectionSettings(agentId?: string, workingDirectory?: string): ResolvedReflectionSettings;
export declare function shouldFireStepCountTrigger(stepsSinceLastSuccessfulReflection: number, settings?: ReflectionSettings): boolean;
type PersistReflectionSettingsOptions = {
    workingDirectory?: string;
    persistLocalProject?: boolean;
    persistGlobal?: boolean;
};
export declare function persistReflectionSettingsForAgent(agentId: string, settings: ReflectionSettings, options?: PersistReflectionSettingsOptions): Promise<void>;
//# sourceMappingURL=memory-reminder.d.ts.map