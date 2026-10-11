import { type ResizeResult } from "./image-resize.shared";
/**
 * Resize image if it exceeds MAX_IMAGE_WIDTH or MAX_IMAGE_HEIGHT.
 * Uses 'inside' fit to preserve aspect ratio (like Codex's resize behavior).
 * Returns original if already within limits and format is supported.
 */
export declare function resizeImageIfNeeded(buffer: Buffer, inputMediaType: string): Promise<ResizeResult>;
//# sourceMappingURL=image-resize.magick.d.ts.map