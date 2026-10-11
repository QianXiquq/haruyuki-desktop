export declare const MANAGED_CLOUD_RUNTIME_ENV = "HARUYUKI_MANAGED_CLOUD_RUNTIME";
/**
 * Preserve execution ownership after the listener consumes its non-inheritable
 * relay identity. Cloud assigns the `sandbox:` namespace; Desktop and manual
 * listeners use different identities.
 */
export declare function markManagedCloudRuntimeFromListenerIdentity(listenerInstanceId: string, env?: NodeJS.ProcessEnv): void;
export declare function isManagedCloudRuntime(env?: NodeJS.ProcessEnv): boolean;
//# sourceMappingURL=managed-cloud-runtime.d.ts.map