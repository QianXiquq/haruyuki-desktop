export type ApiRequestMethod = "GET" | "POST" | "PATCH" | "DELETE";
export interface ApiRequestConfig {
    baseUrl: string;
    apiKey: string;
}
export interface ApiFetchOptions {
    method?: ApiRequestMethod;
    body?: Record<string, unknown>;
    signal?: AbortSignal;
    baseUrl?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | null | undefined>;
}
export declare class ApiRequestError extends Error {
    readonly status: number;
    readonly responseText: string;
    readonly headers?: Headers | undefined;
    constructor(message: string, status: number, responseText: string, headers?: Headers | undefined);
}
export declare function getApiRequestConfig(): Promise<ApiRequestConfig>;
/**
 * Centralized seam for direct Letta API fetches that are not covered by the
 * generated SDK. Keep raw route fetches here so local-mode can swap this layer
 * without hunting through UI/agent code.
 */
export declare function apiFetch(path: string, options?: ApiFetchOptions): Promise<Response>;
export declare function apiRequest<T>(method: ApiRequestMethod, path: string, body?: Record<string, unknown>, options?: Omit<ApiFetchOptions, "method" | "body">): Promise<T>;
//# sourceMappingURL=request.d.ts.map