import type { ListenerRuntime } from "./types";
export declare function getWorkingDirectoryScopeKey(agentId?: string | null, conversationId?: string | null): string;
export declare function getConversationWorkingDirectory(runtime: ListenerRuntime, agentId?: string | null, conversationId?: string | null): string;
/**
 * Repair a boot cwd that disappeared while the listener was running. This can
 * happen when Desktop renames/deletes its default folder or when the directory
 * is changed externally. Runtime-context fallback resolution avoids returning
 * a path that would surface ENOENT/ENOTDIR to a user turn.
 */
export declare function getBootWorkingDirectory(runtime: ListenerRuntime): string;
export declare function pruneStaleConversationWorkingDirectories(runtime: ListenerRuntime): boolean;
export declare function bumpWorkingDirectoryRevision(runtime: ListenerRuntime): number;
/**
 * Change the fallback used by future turns without a conversation CWD.
 * Process globals stay unchanged because active turns may still be using the
 * directory the listener launched with.
 */
export declare function setBootWorkingDirectory(runtime: ListenerRuntime, workingDirectory: string): boolean;
export declare function getExportedCwdMap(runtime: ListenerRuntime): Record<string, string>;
/**
 * @deprecated - the legacy path is only read for one-time migration in remote-settings.ts
 */
export declare function getCwdCachePath(): string;
export declare function loadPersistedCwdMap(): Map<string, string>;
export declare function persistCwdMap(map: Map<string, string>): void;
export declare function setConversationWorkingDirectory(runtime: ListenerRuntime, agentId: string | null, conversationId: string, workingDirectory: string): void;
export declare function seedConversationWorkingDirectory(runtime: ListenerRuntime, agentId: string | null, conversationId: string, workingDirectory: string): boolean;
//# sourceMappingURL=cwd.d.ts.map