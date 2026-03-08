import { HttpClient } from '../utils/http-client';
import { AuthManager } from '../utils/auth-manager';
import {
  CaspitClient,
  CaspitApiClient,
  CreateClientRequest,
  ListClientsOptions,
  PaginatedResponse,
} from '../types/client';
import { ValidationError, APIError } from '../types/error';

/**
 * Caspit API paginated response format
 */
interface CaspitApiPaginatedResponse<T> {
  Results: T[];
  TotalCount: number;
  CurrentPage: number;
  TotalPages: number;
  NextPageUrl: string;
  PrevPageUrl: string;
}

/**
 * Manager for client/contact operations
 */
export class ClientsManager {
  constructor(
    private httpClient: HttpClient,
    private authManager: AuthManager
  ) {}

  /**
   * Map Caspit API client response to our CaspitClient format
   */
  private mapApiClientToClient(apiClient: CaspitApiClient): CaspitClient {
    return {
      id: apiClient.ContactId,
      name: apiClient.BusinessName || apiClient.Name || '',
      type: apiClient.ContactType === 1 ? 1 : 2,
      taxId: apiClient.OsekMorshe || undefined,
      email: apiClient.Email || undefined,
      phone: apiClient.Phone || undefined,
      mobile: apiClient.Mobile || undefined,
      fax: apiClient.Fax || undefined,
      address: apiClient.Address1 || undefined,
      city: apiClient.City || undefined,
      postalCode: apiClient.PostalCode || undefined,
      country: apiClient.Country || undefined,
      notes: apiClient.Comments1 || undefined,
      contactPerson: undefined, // Not in API response
      active: !apiClient.IsOccasional,
    };
  }

  /**
   * List/search clients
   */
  async list(options: ListClientsOptions = {}): Promise<PaginatedResponse<CaspitClient>> {
    const token = await this.authManager.getToken();

    const params: Record<string, unknown> = {
      token,
    };

    if (options.search) {
      params.search = options.search;
    }

    if (options.page) {
      params.page = options.page;
    }

    if (options.limit) {
      params.limit = options.limit;
    }

    if (options.active !== undefined) {
      params.active = options.active ? 1 : 0;
    }

    const response = await this.httpClient.get<CaspitApiPaginatedResponse<CaspitApiClient>>(
      '/contacts',
      { params }
    );

    // Map Caspit API response format to our PaginatedResponse format
    const apiResponse = response.data;

    return {
      data: (apiResponse.Results || []).map((apiClient) => this.mapApiClientToClient(apiClient)),
      total: apiResponse.TotalCount || 0,
      page: apiResponse.CurrentPage || options.page || 0,
      limit: options.limit || (apiResponse.Results?.length || 50),
    };
  }

  /**
   * Get a single client by ID
   */
  async get(clientId: string): Promise<CaspitClient> {
    if (!clientId) {
      throw new ValidationError('Client ID is required', 'clientId');
    }

    const token = await this.authManager.getToken();

    const response = await this.httpClient.get<CaspitApiClient>(`/contacts/${clientId}`, {
      params: { token },
    });

    return this.mapApiClientToClient(response.data);
  }

  /**
   * Create a new client
   */
  async create(data: CreateClientRequest): Promise<CaspitClient> {
    this.validateCreateRequest(data);

    const token = await this.authManager.getToken();

    // Map our request format to Caspit API format
    const apiRequest = {
      Name: data.name,
      ContactType: data.type || 2,
      OsekMorshe: data.taxId,
      Email: data.email,
      Phone: data.phone,
      Mobile: data.mobile,
      Fax: data.fax,
      Address1: data.address,
      City: data.city,
      PostalCode: data.postalCode,
      Country: data.country,
      Comments1: data.notes,
    };

    const response = await this.httpClient.post<CaspitApiClient>(
      '/contacts',
      apiRequest,
      {
        params: { token },
      }
    );

    return this.mapApiClientToClient(response.data);
  }

  /**
   * Update an existing client
   */
  async update(clientId: string, data: Partial<CreateClientRequest>): Promise<CaspitClient> {
    if (!clientId) {
      throw new ValidationError('Client ID is required', 'clientId');
    }

    const token = await this.authManager.getToken();

    // Map our request format to Caspit API format
    const apiRequest: Partial<Record<string, unknown>> = {};
    if (data.name !== undefined) apiRequest.Name = data.name;
    if (data.type !== undefined) apiRequest.ContactType = data.type;
    if (data.taxId !== undefined) apiRequest.OsekMorshe = data.taxId;
    if (data.email !== undefined) apiRequest.Email = data.email;
    if (data.phone !== undefined) apiRequest.Phone = data.phone;
    if (data.mobile !== undefined) apiRequest.Mobile = data.mobile;
    if (data.fax !== undefined) apiRequest.Fax = data.fax;
    if (data.address !== undefined) apiRequest.Address1 = data.address;
    if (data.city !== undefined) apiRequest.City = data.city;
    if (data.postalCode !== undefined) apiRequest.PostalCode = data.postalCode;
    if (data.country !== undefined) apiRequest.Country = data.country;
    if (data.notes !== undefined) apiRequest.Comments1 = data.notes;

    const response = await this.httpClient.put<CaspitApiClient>(
      `/contacts/${clientId}`,
      apiRequest,
      {
        params: { token },
      }
    );

    return this.mapApiClientToClient(response.data);
  }

  /**
   * Delete a client
   */
  async delete(clientId: string): Promise<void> {
    if (!clientId) {
      throw new ValidationError('Client ID is required', 'clientId');
    }

    const token = await this.authManager.getToken();

    await this.httpClient.delete(`/contacts/${clientId}`, {
      params: { token },
    });
  }

  /**
   * Search clients by query string
   */
  async search(query: string, limit?: number): Promise<CaspitClient[]> {
    if (!query || query.trim().length === 0) {
      throw new ValidationError('Search query is required', 'query');
    }

    const result = await this.list({ search: query, limit });
    return result.data;
  }

  /**
   * Find clients by Tax ID (OsekMorshe)
   * Uses the specific osekMorshe parameter for more accurate results
   * Note: The 'd' parameter is required by the Caspit API for this query to work correctly
   * With d=1, the API returns a single client object directly (not a paginated response)
   * Returns empty array if client not found (handles 404 gracefully)
   */
  async findByTaxId(taxId: string): Promise<CaspitClient[]> {
    if (!taxId || taxId.trim().length === 0) {
      throw new ValidationError('Tax ID is required', 'taxId');
    }

    const token = await this.authManager.getToken();

    const params: Record<string, unknown> = {
      token,
      osekmorshe: taxId,
      d: 1, // Required parameter for the query to work correctly (per Caspit API FAQ)
    };

    try {
      const response = await this.httpClient.get<CaspitApiClient>(
        '/contacts',
        { params }
      );

      // With d=1, the API returns a single client object directly (not a paginated response)
      const apiClient = response.data;

      // If the client exists and has a ContactId, return it as an array
      if (apiClient && apiClient.ContactId) {
        return [this.mapApiClientToClient(apiClient)];
      }

      // Return empty array if no client found
      return [];
    } catch (error) {
      // Handle 404 (client not found) gracefully by returning empty array
      if (error instanceof APIError && error.statusCode === 404) {
        return [];
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Validate create client request
   */
  private validateCreateRequest(data: CreateClientRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Client name is required', 'name');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email address', 'email');
    }
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
