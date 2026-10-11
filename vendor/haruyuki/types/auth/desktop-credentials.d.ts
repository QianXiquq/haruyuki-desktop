/** Electron owns the OAuth grant. This process only holds its current token. */
export declare class DesktopCredentialSession {
    private token;
    private closed;
    receive(message: unknown): boolean;
    getAccessToken(): string;
    close(): void;
}
/** Undefined means an ordinary CLI process, never a Desktop fallback. */
export declare function getDesktopAccessToken(): string | undefined;
export declare function initializeDesktopCredentials(): Promise<void>;
/** SDK authHeaders reads apiKey for each request, including retained clients. */
export declare function bindDesktopCredentials<T extends {
    apiKey: string | null;
}>(client: T): T;
//# sourceMappingURL=desktop-credentials.d.ts.map