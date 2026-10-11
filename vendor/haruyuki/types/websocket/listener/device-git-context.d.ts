import { type LightGitContext } from "../../cli/helpers/git-context";
type LoadGitContext = (cwd: string) => Promise<LightGitContext | null>;
export declare class DeviceGitContextCache {
    private readonly load;
    private readonly now;
    private readonly entries;
    private readonly pending;
    constructor(load?: LoadGitContext, now?: () => number);
    read(cwd: string): LightGitContext | null;
    refresh(cwd: string, options?: {
        force?: boolean;
    }): Promise<LightGitContext | null>;
    private prune;
}
export declare const deviceGitContextCache: DeviceGitContextCache;
export {};
//# sourceMappingURL=device-git-context.d.ts.map