import type { OutboundFrameClass } from "./outbound-wire";
type RoutableMessage = {
    type: string;
    removed?: readonly unknown[];
};
export declare function isStreamChannelMessage(type: string): boolean;
export declare function classifyOutboundFrame(message: RoutableMessage): OutboundFrameClass;
export {};
//# sourceMappingURL=protocol-outbound-routing.d.ts.map