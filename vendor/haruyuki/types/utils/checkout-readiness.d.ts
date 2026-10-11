export declare function getCheckoutGeneration(): number;
export declare function retainCheckouts(agentId: string, paths: string[]): void;
export declare function trackCheckoutDiscovery(agentId: string, start: () => Promise<void>): Promise<void>;
/** Start once, share concurrent callers, and retain failures for access-time retry. */
export declare function startCheckout(agentId: string, path: string, start: () => Promise<void>, refresh?: boolean): Promise<void>;
export declare function isCheckoutPending(path: string): boolean;
/** Shells and mod tools can compute paths: conservatively gate those callers. */
export declare function waitForCheckouts(agentId: string | undefined, paths?: string[]): Promise<void>;
export declare function waitForToolCheckouts(agentId: string | undefined, name: string, args: unknown, cwd: string, arbitraryCode?: boolean): Promise<void>;
//# sourceMappingURL=checkout-readiness.d.ts.map