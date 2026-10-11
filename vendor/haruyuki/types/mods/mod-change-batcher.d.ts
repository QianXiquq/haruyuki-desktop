export declare function createModChangeBatcher(onChange: () => void): {
    notify: () => void;
    run<T>(operation: () => Promise<T> | T): Promise<T>;
    runSync<T>(operation: () => T): T;
};
//# sourceMappingURL=mod-change-batcher.d.ts.map