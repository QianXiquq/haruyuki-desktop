import { type ImageFailureModesByMessageOtid } from "../../utils/message-image-normalization";
import type { IncomingMessage } from "./types";
export declare function getInboundImageFailureMode(incoming?: Pick<IncomingMessage, "imageFailureMode">): "strict" | "drop";
export declare function getInboundImageFailureModes(incoming: Pick<IncomingMessage, "imageFailureMode" | "messages">): ImageFailureModesByMessageOtid | undefined;
//# sourceMappingURL=image-policy.d.ts.map