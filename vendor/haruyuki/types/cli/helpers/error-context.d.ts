/**
 * Global context for error formatting.
 * Allows the error formatter to access user/agent context without threading it through every call site.
 */
interface ErrorContext {
    billingTier?: string;
    modelDisplayName?: string;
    modelEndpointType?: string;
    modelLabel?: string;
}
/**
 * Set the error context (call when agent loads or billing info is fetched)
 */
export declare function setErrorContext(context: Partial<ErrorContext>): void;
/**
 * Get the current error context
 */
export declare function getErrorContext(): ErrorContext;
/**
 * Clear the error context
 */
export declare function clearErrorContext(): void;
export {};
//# sourceMappingURL=error-context.d.ts.map