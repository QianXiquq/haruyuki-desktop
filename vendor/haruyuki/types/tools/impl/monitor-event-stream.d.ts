export declare const MONITOR_EVENT_BATCH_MS = 200;
export declare const MONITOR_EVENT_LINE_CHARS = 500;
export declare const MONITOR_EVENT_BATCH_CHARS = 3000;
export declare const MONITOR_EVENT_BUFFER_CHARS: number;
export declare const MONITOR_EVENT_INITIAL_TOKENS = 10;
export declare const MONITOR_EVENT_REFILL_MS = 2000;
export declare const MONITOR_EVENT_SUPPRESSION_STOP_MS = 30000;
type ScheduleFlush = (callback: () => void) => () => void;
export interface MonitorEventStream {
    onData(text: string): void;
    finish(): void;
    cancel(): void;
    isStopped(): boolean;
}
interface MonitorEventStreamOptions {
    emit(event: string): void;
    stopSource(): void;
    now?: () => number;
    scheduleFlush?: ScheduleFlush;
}
export declare function createMonitorEventStream(options: MonitorEventStreamOptions): MonitorEventStream;
export {};
//# sourceMappingURL=monitor-event-stream.d.ts.map