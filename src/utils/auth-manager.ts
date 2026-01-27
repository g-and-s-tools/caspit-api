import { HttpClient } from './http-client';
import { CaspitConfigInternal } from '../types/config';
import { AuthToken, AuthRequest } from '../types/auth';
import { AuthenticationError } from '../types/error';

/**
 * Manages authentication and token lifecycle
 */
export class AuthManager {
  private httpClient: HttpClient;
  private config: CaspitConfigInternal;
  private token: AuthToken | null = null;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor(httpClient: HttpClient, config: CaspitConfigInternal) {
    this.httpClient = httpClient;
    this.config = config;
  }

  /**
   * Get current valid token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    // If token refresh is in progress, wait for it
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    // If token exists and is valid, return it
    if (this.token && this.isTokenValid(this.token)) {
      return this.token.token;
    }

    // Refresh token
    this.tokenRefreshPromise = this.refreshToken();

    try {
      const tokenString = await this.tokenRefreshPromise;
      return tokenString;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Check if token is still valid
   */
  private isTokenValid(token: AuthToken): boolean {
    // If no expiration time is set, assume token is valid for 24 hours
    const expirationTime = token.expiresAt || token.acquiredAt + 24 * 60 * 60 * 1000;

    // Add 5 minute buffer before expiration
    return Date.now() < expirationTime - 5 * 60 * 1000;
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string> {
    try {
      const authRequest: AuthRequest = {
        user: this.config.username,
        pwd: this.config.password,
        osekmorshe: this.config.organizationId,
      };

      if (this.config.debug) {
        console.log('[Caspit API] Authenticating...');
      }

      const response = await this.httpClient.get<string | { token: string }>('/token', {
        params: authRequest,
      });

      let tokenString: string;

      // Handle different response formats
      if (typeof response.data === 'string') {
        tokenString = response.data;
      } else if (response.data && typeof response.data === 'object' && 'token' in response.data) {
        tokenString = response.data.token;
      } else {
        throw new AuthenticationError('Invalid token response format');
      }

      if (!tokenString || tokenString.length === 0) {
        throw new AuthenticationError('Empty token received from API');
      }

      this.token = {
        token: tokenString,
        acquiredAt: Date.now(),
      };

      if (this.config.debug) {
        console.log('[Caspit API] Authentication successful');
      }

      return tokenString;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        `Failed to authenticate: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Force token refresh
   */
  async forceRefresh(): Promise<string> {
    this.token = null;
    return this.getToken();
  }

  /**
   * Clear current token
   */
  clearToken(): void {
    this.token = null;
  }
}
