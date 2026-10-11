import { type ResizeResult } from "./image-resize.shared";
export type { ResizeResult } from "./image-resize.shared";
export { isHeicMediaType, MAX_IMAGE_BYTES, MAX_IMAGE_HEIGHT, MAX_IMAGE_INPUT_PIXELS, MAX_IMAGE_WIDTH, } from "./image-resize.shared";
export declare class ImageWorkerMissingError extends Error {
    readonly workerPath: string;
    constructor(workerPath: string);
}
export declare function resizeImageIfNeeded(buffer: Buffer, inputMediaType: string): Promise<ResizeResult>;
//# sourceMappingURL=image-resize.d.ts.map