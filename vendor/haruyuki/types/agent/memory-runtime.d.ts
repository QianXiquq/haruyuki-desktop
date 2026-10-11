/**
 * Runtime MemFS state for the active backend.
 *
 * Cloud/API MemFS is an agent setting. Local backend MemFS is a backend
 * capability unless explicitly disabled before backend construction, so most
 * UI surfaces should treat local backend agents as MemFS-enabled even before a
 * persisted per-agent setting exists.
 */
export declare function isActiveMemfsEnabled(agentId: string): boolean;
export declare function getActiveMemoryDirectory(agentId: string): string | undefined;
export declare function isLocalMemfsActive(): boolean;
//# sourceMappingURL=memory-runtime.d.ts.map