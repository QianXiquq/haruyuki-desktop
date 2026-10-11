import type { ModInvocationContext } from "./types";
export type ModNotificationHandler = (message: string, context: ModInvocationContext | null) => void;
export declare function notifyMod(handler: ModNotificationHandler, message: string): void;
export declare function runWithModInvocationContext<TResult>(context: ModInvocationContext, callback: () => TResult): TResult;
export declare function invoke<TEvent, TContext extends ModInvocationContext, TResult>(context: TContext, registration: {
    handler: (event: TEvent, context: TContext) => TResult;
}, event: TEvent): TResult;
//# sourceMappingURL=invocation-context.d.ts.map