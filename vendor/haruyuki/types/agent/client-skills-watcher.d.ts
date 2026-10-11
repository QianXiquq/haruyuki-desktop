import { type FSWatcher } from "node:fs";
type WatchListener = (eventType: string, filename: string | Buffer | null) => void;
export type SkillWatchFunction = (path: string, options: {
    persistent: false;
    recursive: boolean;
}, listener: WatchListener) => FSWatcher;
/**
 * Keeps skill cache validation off the model-request path. Each configured
 * root is watched until its first mutation, which invalidates the cache and
 * closes all watchers. The next request installs fresh watchers while it
 * rebuilds the skill snapshot.
 */
export declare class ClientSkillsWatcher {
    private readonly onChange;
    private readonly watchFunction;
    private readonly watchersByRoot;
    constructor(onChange: () => void, watchFunction?: SkillWatchFunction);
    ensureRoots(roots: string[]): void;
    close(): void;
    private watchRoot;
}
export {};
//# sourceMappingURL=client-skills-watcher.d.ts.map