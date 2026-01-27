/**
 * Authentication token response from Caspit API
 */
export interface AuthToken {
  /**
   * The authentication token string
   */
  token: string;

  /**
   * Token expiration timestamp (if provided by API)
   */
  expiresAt?: number;

  /**
   * Time when token was acquired
   */
  acquiredAt: number;
}

/**
 * Authentication request payload
 */
export interface AuthRequest {
  user: string;
  pwd: string;
  osekmorshe: string;
}
