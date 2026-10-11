export declare function validateRequiredParams<T extends object>(args: T, required: string[], toolName: string): void;
interface JsonSchema {
    type?: string;
    properties?: Record<string, JsonSchema>;
    items?: JsonSchema;
    required?: string[];
    [key: string]: unknown;
}
/**
 * Validates that parameter values match their expected types from the JSON schema.
 * Throws a clear error if types don't match.
 */
export declare function validateParamTypes(args: Record<string, unknown>, schema: JsonSchema, toolName: string): void;
export {};
//# sourceMappingURL=validation.d.ts.map