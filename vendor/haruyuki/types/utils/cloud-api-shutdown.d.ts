export declare const CLOUD_API_UNAVAILABLE_MESSAGE = "Service temporarily unavailable. Please retry your request.";
export type CloudApiShutdownError = {
    status: 503;
    error: Record<string, unknown>;
    headers?: unknown;
};
export type CloudApiDeploymentInterruptedError = {
    error_type: "internal_error";
    error_code: "cloud_api_deployment_interrupted";
    status_code: 503;
    retryable: true;
    run_id?: string;
};
export declare function isCloudApiDeploymentInterrupted(error: unknown): error is CloudApiDeploymentInterruptedError;
export declare function isCloudApiShutdownRejection(error: unknown): error is CloudApiShutdownError;
export declare function shouldEmitRetryNotice(error: unknown): boolean;
//# sourceMappingURL=cloud-api-shutdown.d.ts.map