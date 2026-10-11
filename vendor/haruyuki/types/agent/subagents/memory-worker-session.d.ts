/**
 * Marks a child CLI process as a background memory worker. Kept free of
 * imports so launchers and the headless sender can check it without loading
 * the worker's sync and backend dependencies.
 */
export declare const MEMORY_WORKER_SESSION_ENV = "HARUYUKI_MEMORY_WORKER_SESSION";
export declare function isMemoryWorkerSession(env?: NodeJS.ProcessEnv): boolean;
//# sourceMappingURL=memory-worker-session.d.ts.map