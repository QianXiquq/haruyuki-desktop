import type { ProviderTurnInput } from "./provider-turn-executor";
export declare function isOversizedPayloadTransportFailure(input: ProviderTurnInput): boolean;
export interface ImagePayloadElision {
    input: ProviderTurnInput;
    beforeBytes: number;
    afterBytes: number;
    requestByteLimit: number;
    requestByteTarget: number;
    elidedImages: number;
    elidedBytes: number;
}
export declare function elideImagePayloadsForProviderRetry(input: ProviderTurnInput, options?: {
    allowUnderLimit?: boolean;
}): ImagePayloadElision | null;
//# sourceMappingURL=pi-image-elision.d.ts.map