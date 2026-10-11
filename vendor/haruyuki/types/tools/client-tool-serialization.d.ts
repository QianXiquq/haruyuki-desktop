import { type ModelFacingToolForm } from "./model-facing-tool";
interface ClientToolShape {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}
interface BuiltInToolShape {
    modelForm: ModelFacingToolForm;
}
interface NamedToolShape extends ClientToolShape {
}
interface ExternallyOwnedNamedToolShape extends NamedToolShape {
    connectionId?: string;
}
/** Collapse internal registrations to one model-facing tool per name. */
export declare function selectModelFacingExternalTools<T extends ExternallyOwnedNamedToolShape>(externalTools: ReadonlyMap<string, T>, preferredConnectionId?: string | null): Map<string, T>;
export declare function serializeClientTools(registry: ReadonlyMap<string, BuiltInToolShape>, externalTools: ReadonlyMap<string, NamedToolShape>, modTools: ReadonlyMap<string, NamedToolShape>, getServerToolName: (name: string) => string): ClientToolShape[];
export {};
//# sourceMappingURL=client-tool-serialization.d.ts.map