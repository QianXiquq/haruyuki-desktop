interface ProcessIdentity {
    startTicks: string | null;
    bootId: string | null;
}
export declare function captureProcessIdentity(pid: number): {
    process_start_ticks: string | null;
    boot_id: string | null;
};
export declare function isProcessAlive(pid: number, owner?: {
    process_start_ticks?: string | null;
    boot_id?: string | null;
} | null): boolean;
export declare function __testOverrideReadProcessIdentity(fn: ((pid: number) => ProcessIdentity | null) | null): void;
export {};
//# sourceMappingURL=process-identity.d.ts.map