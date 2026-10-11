export declare const WORKLOAD_SYSTEMD_SLICE_ENV = "HARUYUKI_WORKLOAD_SYSTEMD_SLICE";
type WorkloadScopeOptions = {
    env?: NodeJS.ProcessEnv;
    platform?: NodeJS.Platform;
};
/**
 * Moves a managed agent workload into the systemd slice named by Cloud.
 *
 * Local, container, macOS, and Windows runtimes do not set the opt-in env var,
 * so their process launchers remain unchanged. The managed Linux VM snapshot
 * owns the slice and its aggregate memory limit.
 */
export declare function wrapManagedWorkloadLauncher(launcher: string[], options?: WorkloadScopeOptions): string[];
export {};
//# sourceMappingURL=systemd-workload-scope.d.ts.map