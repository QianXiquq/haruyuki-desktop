import type { KnownApi, ProviderStreams } from "@earendil-works/pi-ai";
/**
 * ProviderStreams implementations for every pi-ai API, keyed by `model.api`.
 * Used by providers whose models may span multiple APIs (mod-registered
 * providers) and by dispatch-only providers for models whose owner has not
 * yet been migrated onto the Models runtime. All implementations are lazy —
 * the underlying API module loads on first stream.
 */
export declare function knownApiStreams(): Partial<Record<KnownApi, ProviderStreams>>;
//# sourceMappingURL=pi-api-streams.d.ts.map