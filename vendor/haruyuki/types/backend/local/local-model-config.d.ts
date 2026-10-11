import { type ModelThinkingLevel } from "@earendil-works/pi-ai";
import { type PiProvider, UNSELECTED_LOCAL_MODEL_HANDLE } from "../dev/pi-model-factory";
import { LocalPiModelsRuntime } from "../dev/pi-models-runtime";
import { localModelHandle, localProviderType, resolveLocalModel } from "../dev/pi-provider-registry";
export interface LocalModelConfig {
    provider: PiProvider;
    model: string;
    handle: string;
    modelSettings: Record<string, unknown>;
}
export { UNSELECTED_LOCAL_MODEL_HANDLE };
interface LocalModelListEntry {
    display_name: string;
    handle: string;
    max_context_window?: number;
    max_tokens?: number;
    model: string;
    model_id?: string;
    model_endpoint_type: string;
    name: string;
    provider_type: string;
    reasoning_levels?: ModelThinkingLevel[];
}
interface ListLocalModelsOptions {
    fetch?: typeof fetch;
    /**
     * Per-backend pi-ai Models runtime that owns all dynamic model discovery.
     * When omitted, a call-scoped runtime is created (honoring `fetch`), so
     * /model and turn execution always read provider-published Model objects.
     */
    modelsRuntime?: LocalPiModelsRuntime;
}
export declare function resolveLocalProvider(storageDir?: string): PiProvider;
export { localModelHandle, localProviderType, resolveLocalModel };
export declare function localModelSettingsForHandle(handle: string | undefined, modelsRuntime?: LocalPiModelsRuntime): Record<string, unknown> | undefined;
export declare function resolveLocalModelConfig(storageDir?: string, modelsRuntime?: LocalPiModelsRuntime): LocalModelConfig;
export declare function resolveAvailableLocalModelForTurn(input: {
    model?: string | null;
    modelSettings?: Record<string, unknown> | null;
    storageDir?: string;
    modelsRuntime?: LocalPiModelsRuntime;
}): Promise<{
    model?: string;
    modelSettings: Record<string, unknown>;
}>;
export declare function listLocalModels(storageDir?: string, options?: ListLocalModelsOptions): Promise<LocalModelListEntry[]>;
//# sourceMappingURL=local-model-config.d.ts.map