import { refreshAccessToken, type TokenResponse } from "./oauth";
type RefreshAccessToken = typeof refreshAccessToken;
export declare function refreshAccessTokenSingleFlight(refreshToken: string, deviceId: string, deviceName?: string, refresh?: RefreshAccessToken): Promise<TokenResponse>;
export {};
//# sourceMappingURL=oauth-refresh.d.ts.map