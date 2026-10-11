/**
 * The runtime model catalog and pure handle resolution.
 *
 * Cloud mode hydrates this catalog from GET /v1/models/catalog. Local mode
 * hydrates it from the active backend's pi-ai model inventory. Keeping the
 * array identity stable lets synchronous consumers observe source changes
 * without bundling a second model registry.
 */
/** A model catalog entry shared by cloud presets and local pi-ai models. */
export interface CatalogModel {
    id: string;
    handle: string;
    label: string;
    description: string;
    supportsStructuredOutputs?: boolean;
    shortLabel?: string;
    isDefault?: boolean;
    isFeatured?: boolean;
    free?: boolean;
    updateArgs?: Record<string, unknown>;
}
/**
 * The live model catalog. Startup initializes it before model resolution:
 * cloud backends use GET /v1/models/catalog and local backends use pi-ai.
 * Source changes replace the contents in place, so consumers that read at
 * call time pick up current data without capturing a stale array reference.
 */
export declare const models: CatalogModel[];
/** Resolve a model catalog entry by runtime ID, handle, or CLI alias. */
export declare function resolveCatalogModel(modelIdentifier: string): CatalogModel | null;
/** Resolve a model by ID or handle. */
export declare function resolveModel(modelIdentifier: string): string | null;
/** Get the default model handle from the active catalog. */
export declare function getDefaultModel(): string;
//# sourceMappingURL=model-catalog.d.ts.map