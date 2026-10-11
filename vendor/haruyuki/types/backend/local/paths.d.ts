export { getLocalBackendCrossAgentTreeRoot, getLocalBackendStorageDir, LOCAL_BACKEND_DIR_ENV, } from "../../utils/local-backend-paths";
export declare const LOCAL_BACKEND_EXPERIMENTAL_ENV = "HARUYUKI_LOCAL_BACKEND_EXPERIMENTAL";
export declare function isLocalBackendEnvEnabled(env?: NodeJS.ProcessEnv): boolean;
export declare function disableLocalBackendMemfsForProcess(): void;
/** Test-only: restore the default (memfs enabled) after a test disabled it. */
export declare function resetLocalBackendMemfsForProcess(): void;
export declare function isLocalBackendMemfsDisabledForProcess(): boolean;
export declare function getLocalBackendMemoryFilesystemRoot(agentId: string, storageDir?: string): string;
//# sourceMappingURL=paths.d.ts.map