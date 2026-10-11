export declare function supportedModelSettingsFromBody(bodyRecord: Record<string, unknown>): Record<string, unknown>;
export declare function providerTypeFromModelSettings(modelSettings: Record<string, unknown> | undefined): string | null;
export declare function normalizeLocalModelHandle(model: string, modelSettings?: Record<string, unknown>, legacyLlmConfig?: Record<string, unknown>): string;
export declare function modelHandleFromLegacyLlmConfig(legacyLlmConfig: Record<string, unknown>): string | null;
export declare function supportedConversationModelSettingsFromBody(bodyRecord: Record<string, unknown>): Record<string, unknown> | null | undefined;
export declare function normalizeStoredLocalModelRecord<T extends {
    model?: string | null;
    model_settings?: unknown;
}>(record: T): T;
export declare function localLlmConfigModelPatch(model: string, modelSettings: Record<string, unknown>): Pick<import("../../agent/model-handles").ModelConfigSnapshot, "model" | "model_endpoint_type">;
//# sourceMappingURL=local-model-normalization.d.ts.map