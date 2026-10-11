export interface LocalProviderErrorInfo {
    message: string;
    detail: string;
    error_type: "llm_error" | "local_backend_error";
    retryable: boolean;
    stop_reason: "llm_api_error" | "error";
}
export declare function localProviderErrorDetail(error: unknown): string;
export declare function isRetryableLocalProviderError(error: unknown): boolean;
export declare function normalizeLocalProviderError(error: unknown): LocalProviderErrorInfo;
export declare function localProviderRetryDelayMs(error: unknown, attempt: number): number;
export declare function localProviderRetryMessage(error: unknown): string;
//# sourceMappingURL=local-provider-errors.d.ts.map