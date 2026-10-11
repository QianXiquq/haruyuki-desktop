declare module "./settings-manager" {
    interface Settings {
        /** Agent markers sooner than this many user turns are warned about. 0 = off. */
        topicMarkerWarnTurns?: number;
        /** Agent markers sooner than this many user turns are refused. 0 = off. */
        topicMarkerRejectTurns?: number;
        /** User turns without a marker before the one-shot nudge. 0 = off. */
        topicNudgeTurns?: number;
        /** Advisory pressure share of the window. 0 = the soft tier is off. */
        topicSoftPressureRatio?: number;
        /** User turns the effective boundary rewinds from a marker anchor (0–3). */
        topicBoundaryRewindTurns?: number;
    }
}
/**
 * The settings keys this module owns.
 *
 * A union rather than an enumerating array: the only reader is
 * `resolveTopicSettings`, and the key list already exists once, as the fields of
 * the `Settings` augmentation above.
 */
export type TopicSettingKey = "topicMarkerWarnTurns" | "topicMarkerRejectTurns" | "topicNudgeTurns" | "topicSoftPressureRatio" | "topicBoundaryRewindTurns";
/** Every knob resolved; the shape the rest of the app consumes. */
export interface ResolvedTopicSettings {
    markerWarnTurns: number;
    markerRejectTurns: number;
    nudgeTurns: number;
    softPressureRatio: number;
    boundaryRewindTurns: number;
}
export declare const TOPIC_SETTING_DEFAULTS: ResolvedTopicSettings;
/** Resolve every knob from a settings record, ignoring unusable values. */
export declare function resolveTopicSettings(record: Partial<Record<TopicSettingKey, unknown>> | undefined): ResolvedTopicSettings;
/**
 * The knobs as configured. Settings unavailable (early startup, tests without
 * an initialized manager) falls back to the defaults rather than throwing:
 * every reader runs on a path that must not fail because of a preference.
 */
export declare function readTopicSettings(): ResolvedTopicSettings;
//# sourceMappingURL=topic-settings.d.ts.map