/**
 * Cross-process lock for remote-settings.json.
 *
 * Primary locks and recovery claims are fully initialized before hard-link
 * publication, so another process never observes an ownerless lock. Recovery
 * claims form an immutable chain scoped to one dead primary token: a live
 * claim owner blocks recovery, while a crashed recovery owner is bypassed at
 * the next depth. This prevents two recoverers from unlinking different
 * generations of the primary lock.
 *
 * The protocol is for a local filesystem shared by processes on one host. A
 * listener upgrade must stop the old listener before starting code that uses a
 * different lock protocol.
 */
export interface RemoteSettingsLockHandle {
    lockPath: string;
    ownerToken: string;
}
export declare function tryAcquireRemoteSettingsLockSync(lockPath: string): RemoteSettingsLockHandle | null;
export declare function tryAcquireRemoteSettingsLock(lockPath: string): Promise<RemoteSettingsLockHandle | null>;
export declare function releaseRemoteSettingsLockSync(handle: RemoteSettingsLockHandle): void;
export declare function releaseRemoteSettingsLock(handle: RemoteSettingsLockHandle): Promise<void>;
export declare function flushAbandonedRemoteSettingsLock(deadline: number): Promise<boolean>;
//# sourceMappingURL=remote-settings-lock.d.ts.map