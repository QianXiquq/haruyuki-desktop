export declare const MAX_IMAGE_WIDTH = 2000;
export declare const MAX_IMAGE_HEIGHT = 2000;
export declare const MAX_IMAGE_BYTES: number;
export declare const MAX_IMAGE_INPUT_PIXELS = 25000000;
export interface ResizeResult {
    data: string;
    mediaType: string;
    width: number;
    height: number;
    resized: boolean;
}
export declare function isHeicMediaType(mediaType?: string | null): boolean;
export declare function mediaTypeForDecodedImageFormat(format?: string | null): string | null;
export declare function canonicalizeOutputMediaType(decodedFormat: string | null | undefined, fallbackMediaType: string): string;
export declare function assertImageHasDimensions(width: number, height: number, context: string): void;
export declare function assertImageWithinBounds(width: number, height: number, context: string): void;
export declare function buildResizeResult(buffer: Buffer, mediaType: string, width: number, height: number, resized: boolean): ResizeResult;
//# sourceMappingURL=image-resize.shared.d.ts.map