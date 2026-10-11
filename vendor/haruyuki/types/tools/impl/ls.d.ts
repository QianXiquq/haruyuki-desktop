interface LSArgs {
    path: string;
    ignore?: string[];
}
export declare function ls(args: LSArgs): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
export {};
//# sourceMappingURL=ls.d.ts.map