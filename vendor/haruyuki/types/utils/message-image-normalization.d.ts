import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { ApprovalCreate } from "@letta-ai/letta-client/resources/agents/messages";
import { resizeImageIfNeeded } from "./image-resize";
export declare const SUPPORTED_BASE64_IMAGE_MEDIA_TYPES: Set<string>;
export type Base64ImageContentPart = {
    type: "image";
    source: {
        type: "base64";
        media_type: string;
        data: string;
    };
};
export type ImageNormalizationFailureMode = "strict" | "drop";
export type ImageFailureModesByMessageOtid = Readonly<Record<string, ImageNormalizationFailureMode>>;
type NormalizeMessageImagePartsOptions = {
    failureModesByMessageOtid?: ImageFailureModesByMessageOtid;
    resize?: typeof resizeImageIfNeeded;
};
export declare function isBase64ImageContentPart(part: unknown): part is Base64ImageContentPart;
export declare function normalizeMessageImageParts<T extends ApprovalCreate | MessageCreate>(messages: T[], options?: NormalizeMessageImagePartsOptions): Promise<T[]>;
export declare function buildImageFailureModesByMessageOtid(messages: Array<ApprovalCreate | MessageCreate>, failureMode: ImageNormalizationFailureMode): ImageFailureModesByMessageOtid | undefined;
export declare function mergeImageFailureModesByMessageOtid(...failureModes: Array<ImageFailureModesByMessageOtid | undefined>): ImageFailureModesByMessageOtid | undefined;
export declare function assertSupportedBase64ImageMediaTypes(messages: Array<ApprovalCreate | MessageCreate>): void;
export {};
//# sourceMappingURL=message-image-normalization.d.ts.map