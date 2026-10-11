type FatalErrorType = "uncaught_exception" | "unhandled_rejection";
interface FatalErrorHandlerOptions {
    drain: () => Promise<void>;
    trackError: (errorType: FatalErrorType, message: string, context: string) => void;
    timeoutMs?: number;
}
/**
 * Installs one-shot fatal handlers that preserve process-failure semantics
 * while giving the crash report a bounded opportunity to reach the local
 * boundary-error log.
 */
export declare function installFatalErrorHandlers(options: FatalErrorHandlerOptions): () => void;
export {};
//# sourceMappingURL=fatal-error-handler.d.ts.map