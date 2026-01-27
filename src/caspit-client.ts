import { CaspitConfig, CaspitConfigInternal } from './types/config';
import { HttpClient } from './utils/http-client';
import { AuthManager } from './utils/auth-manager';
import { ClientsManager } from './managers/clients-manager';
import { DocumentsManager } from './managers/documents-manager';

/**
 * Main Caspit API Client
 */
export class CaspitClient {
  /**
   * Clients/Contacts manager
   */
  public readonly clients: ClientsManager;

  /**
   * Documents manager
   */
  public readonly documents: DocumentsManager;

  private httpClient: HttpClient;
  private authManager: AuthManager;
  private config: CaspitConfigInternal;

  /**
   * Create a new Caspit API client
   *
   * @example
   * ```typescript
   * const client = new CaspitClient({
   *   username: 'your-username',
   *   password: 'your-password',
   *   organizationId: 'your-org-id',
   * });
   * ```
   */
  constructor(config: CaspitConfig) {
    this.config = this.normalizeConfig(config);
    this.httpClient = new HttpClient(this.config);
    this.authManager = new AuthManager(this.httpClient, this.config);

    // Initialize managers
    this.clients = new ClientsManager(this.httpClient, this.authManager);
    this.documents = new DocumentsManager(this.httpClient, this.authManager);
  }

  /**
   * Normalize configuration with defaults
   */
  private normalizeConfig(config: CaspitConfig): CaspitConfigInternal {
    return {
      username: config.username,
      password: config.password,
      organizationId: config.organizationId,
      baseUrl: config.baseUrl || 'https://app.caspit.biz/api/v1',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      debug: config.debug || false,
      format: config.format || 'json',
    };
  }

  /**
   * Test the API connection and authentication
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authManager.getToken();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Force refresh the authentication token
   */
  async refreshToken(): Promise<void> {
    await this.authManager.forceRefresh();
  }

  /**
   * Clear the current authentication token
   */
  clearToken(): void {
    this.authManager.clearToken();
  }

  /**
   * Get the current configuration
   */
  getConfig(): Readonly<CaspitConfigInternal> {
    return Object.freeze({ ...this.config });
  }
}
