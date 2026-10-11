import type { ModContext, ModEventEmissionResult, ModEventMap, ModEventName } from "./types";
export type ModEvents = {
    /** Synchronous capability check used when execution cannot outlive a hook. */
    hasHandlers?: (name: ModEventName) => boolean;
    emit: <TName extends ModEventName>(name: TName, event: ModEventMap[TName], context: ModContext) => Promise<ModEventEmissionResult<TName>>;
};
export declare function emptyEventEmissionResult<TName extends ModEventName>(name: TName): ModEventEmissionResult<TName>;
export declare function emitModEvent<TName extends ModEventName>(events: ModEvents | undefined, name: TName, event: ModEventMap[TName], context: ModContext): Promise<ModEventEmissionResult<TName>>;
//# sourceMappingURL=event-emitter.d.ts.map