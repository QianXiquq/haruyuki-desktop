/** Publish a fresh checkout only after clone, credentials, and hooks are ready. */
export declare function withRepositoryCheckout<T>(directory: string, work: (directory: string, fresh: boolean) => Promise<T>): Promise<T>;
//# sourceMappingURL=repository-checkout.d.ts.map