type ArtifactEncoding = "utf8" | "base64";
interface ReadArtifactFileArgs {
    path: string;
    encoding?: ArtifactEncoding;
}
interface WriteArtifactFileArgs {
    path: string;
    content: string;
    encoding?: ArtifactEncoding;
}
interface ReadArtifactFileResult {
    path: string;
    content: string;
    encoding: ArtifactEncoding;
}
interface WriteArtifactFileResult {
    path: string;
    bytes: number;
    message: string;
}
export declare function read_artifact_file(args: ReadArtifactFileArgs): Promise<ReadArtifactFileResult>;
export declare function write_artifact_file(args: WriteArtifactFileArgs): Promise<WriteArtifactFileResult>;
export {};
//# sourceMappingURL=artifact-files.d.ts.map