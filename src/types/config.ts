/**
 * Configuration options for the Caspit API client
 */
export interface CaspitConfig {
  /**
   * Caspit username
   */
  username: string;

  /**
   * Caspit password
   */
  password: string;

  /**
   * Organization ID (osekmorshe)
   */
  organizationId: string;

  /**
   * API base URL
   * @default 'https://app.caspit.biz/api/v1'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Response format preference
   * @default 'json'
   */
  format?: 'json' | 'xml';
}

/**
 * Internal configuration with all defaults applied
 */
export interface CaspitConfigInternal extends Required<CaspitConfig> {}
