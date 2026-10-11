export interface JsonSchema {
    properties?: Record<string, JsonSchema>;
    required?: string[];
    [key: string]: unknown;
}
export type FunctionToolForm = {
    type: "function";
    description: string;
    parameters: JsonSchema;
};
export type CustomToolInputFormat = {
    type: "text";
} | {
    type: "grammar";
    syntax: "lark" | "regex";
    definition: string;
};
export type CustomToolForm = {
    type: "custom";
    description: string;
    format?: CustomToolInputFormat;
    functionFallback: FunctionToolForm;
};
export type ModelFacingToolForm = FunctionToolForm | CustomToolForm;
export type FunctionOnlyToolPayload = {
    name: string;
    description: string;
    parameters: JsonSchema;
};
export declare function functionToolForm(input: {
    description: string;
    parameters: JsonSchema;
}): FunctionToolForm;
export declare function serializeFunctionOnlyToolPayload(name: string, form: ModelFacingToolForm): FunctionOnlyToolPayload;
//# sourceMappingURL=model-facing-tool.d.ts.map