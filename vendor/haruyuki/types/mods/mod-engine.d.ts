import type Letta from "@letta-ai/letta-client";
import type { Backend } from "../backend";
import type { PiProviderRegistration } from "../backend/dev/pi-provider-mod-registry";
import * as modInvocationContext from "./invocation-context";
import type { LocalModSource, ResolveLocalModSourcesOptions } from "./mod-sources";
import { type ModPermissionDefinition } from "./permission-registry";
import { type ModToolDefinition } from "./tool-registry";
import type { ModCapabilities, ModCommand, ModCommandRegistration, ModContext, ModDiagnostic, ModDiagnosticReportOptions, ModEventEmissionResult, ModEventHandler, ModEventMap, ModEventName, ModEventRegistration, ModOwner, ModPanel, ModPanelHandle, ModPanelOptions, ModPermissionRegistration, ModToolRegistration } from "./types";
export type { LocalModSource, ResolveLocalModSourcesOptions, } from "./mod-sources";
export { resolveLocalModSources } from "./mod-sources";
export declare const GLOBAL_MODS_DIRECTORY: string;
export declare const LEGACY_GLOBAL_EXTENSIONS_DIRECTORY: string;
export declare const MOD_CACHE_DIRECTORY: string;
export type HaruyukiModDisposer = () => void;
export type ModCapabilityDiagnosticRecorder = (diagnostic: Pick<ModDiagnostic, "capability" | "error" | "phase" | "severity">) => void;
export type HaruyukiModFactory = (haruyuki: HaruyukiModApi) => undefined | HaruyukiModDisposer | Promise<undefined | HaruyukiModDisposer>;
export interface HaruyukiModApi {
    capabilities: ModCapabilities;
    client: Letta;
    getClient: () => Promise<Letta>;
    signal: AbortSignal;
    registerProvider: (name: string, config: PiProviderRegistration) => HaruyukiModDisposer;
    unregisterProvider: (name: string) => void;
    commands: {
        register: (command: ModCommandRegistration) => HaruyukiModDisposer;
        unregister: (id: string) => void;
    };
    tools: {
        register: (tool: ModToolRegistration) => HaruyukiModDisposer;
        unregister: (name: string) => void;
    };
    providers: {
        register: (name: string, config: PiProviderRegistration) => HaruyukiModDisposer;
        unregister: (name: string) => void;
    };
    events: {
        off: <TName extends ModEventName>(name: TName, handler: ModEventHandler<TName>) => void;
        on: <TName extends ModEventName>(name: TName, handler: ModEventHandler<TName>) => HaruyukiModDisposer;
    };
    permissions: {
        register: (permission: ModPermissionRegistration) => HaruyukiModDisposer;
        unregister: (id: string) => void;
    };
    diagnostics: {
        report: (diagnostic: ModDiagnosticReportOptions) => void;
    };
    ui: {
        closePanel: (id: string) => void;
        notify: (message: string) => void;
        openPanel: (panel: ModPanelOptions) => ModPanelHandle;
        /** @deprecated Removed. Use openPanel; calls emit a migration diagnostic. */
        setStatus: (key: string, value?: unknown) => void;
        /** @deprecated Removed. Use openPanel; calls emit a migration diagnostic. */
        clearStatus: (key: string) => void;
        /** @deprecated Removed. Use openPanel; calls emit a migration diagnostic. */
        setStatuslineRenderer: (renderer: unknown) => void;
    };
}
export interface LocalModDisposer {
    abortController?: AbortController;
    dispose: HaruyukiModDisposer;
    owner: ModOwner;
}
export interface LocalModUiRegistry {
    panels: Record<string, ModPanel>;
}
type LocalModEventsRegistry = Partial<Record<ModEventName, ModEventRegistration[]>>;
export interface LocalModRegistry {
    capabilities: ModCapabilities;
    commands: Record<string, ModCommand>;
    diagnostics: ModDiagnostic[];
    disposers: LocalModDisposer[];
    events: LocalModEventsRegistry;
    generation: number;
    loadedPaths: string[];
    ownerAbortControllers: Record<string, AbortController>;
    owners: Record<string, ModOwner>;
    permissions: Record<string, ModPermissionDefinition>;
    registerCapabilitiesGlobally: boolean;
    sources: LocalModSource[];
    tools: Record<string, ModToolDefinition>;
    ui: LocalModUiRegistry;
}
export interface LoadLocalModsOptions extends ResolveLocalModSourcesOptions {
    getClient: () => Promise<Letta>;
    capabilities?: ModCapabilities;
    builtinCommandIds?: Iterable<string>;
    generation?: number;
    onChange?: () => void;
    onDiagnostic?: (diagnostic: ModDiagnostic) => void;
    onNotification?: modInvocationContext.ModNotificationHandler;
    onRegistryCreated?: (registry: LocalModRegistry) => void;
    registerCapabilitiesGlobally?: boolean;
    reservedToolNames?: Iterable<string>;
}
export interface ModEngine {
    dispose: () => void;
    emitEvent: <TName extends ModEventName>(name: TName, event: ModEventMap[TName], context: ModContext) => Promise<ModEventEmissionResult<TName>>;
    getSnapshot: () => LocalModRegistry;
    reload: () => Promise<void>;
    subscribe: (listener: () => void) => () => void;
}
export interface CreateModEngineOptions extends LoadLocalModsOptions {
    getBackend?: () => Backend | undefined;
}
export declare function __testOverrideRuntimePackageDirectoryResolver(resolver: ((packageName: string) => string) | null): void;
export declare function loadLocalMods(options: LoadLocalModsOptions): Promise<LocalModRegistry>;
export declare function emitLocalModEvent<TName extends ModEventName>(registry: LocalModRegistry | null, name: TName, event: ModEventMap[TName], context: ModContext, backend?: Backend, onDiagnostic?: (diagnostic: ModDiagnostic) => void): Promise<ModEventEmissionResult<TName>>;
export declare function disposeLocalMods(registry: LocalModRegistry): void;
export declare function createModEngine(options: CreateModEngineOptions): ModEngine;
//# sourceMappingURL=mod-engine.d.ts.map