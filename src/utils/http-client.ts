import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { CaspitConfigInternal } from '../types/config';
import { APIError, NetworkError, RateLimitError } from '../types/error';

/**
 * HTTP Client with retry logic and error handling
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private config: CaspitConfigInternal;

  constructor(config: CaspitConfigInternal) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: config.format === 'json' ? 'application/json' : 'application/xml',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for logging and error handling
   */
  private setupInterceptors(): void {
    // Request interceptor for debugging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          console.log(`[Caspit API] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for debugging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.config.debug) {
          console.log(`[Caspit API] Response:`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Make HTTP request with automatic retry logic
   */
  async request<T>(
    config: AxiosRequestConfig,
    retries: number = this.config.maxRetries
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.request<T>(config);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return this.handleAxiosError<T>(error, config, retries);
      }
      throw new NetworkError('Unexpected error occurred', error as Error);
    }
  }

  /**
   * Extract error message from axios error response
   */
  private getErrorMessage(error: AxiosError): string {
    const responseData = error.response?.data as { message?: string } | undefined;
    return responseData?.message || error.message || 'API request failed';
  }

  /**
   * Handle axios errors with retry logic
   */
  private async handleAxiosError<T>(
    error: AxiosError,
    config: AxiosRequestConfig,
    retries: number
  ): Promise<AxiosResponse<T>> {
    const statusCode = error.response?.status || 0;

    // Handle rate limiting
    if (statusCode === 429) {
      const retryAfter = parseInt(error.response?.headers['retry-after'] || '60', 10);
      throw new RateLimitError(`Rate limit exceeded. Retry after ${retryAfter} seconds`, retryAfter);
    }

    // Handle client errors (4xx) - don't retry
    if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
      throw new APIError(
        this.getErrorMessage(error),
        statusCode,
        error.response?.data
      );
    }

    // Handle server errors (5xx) and network errors - retry with exponential backoff
    if ((statusCode >= 500 || !statusCode) && retries > 0) {
      const delay = this.calculateBackoff(this.config.maxRetries - retries);

      if (this.config.debug) {
        console.log(`[Caspit API] Retrying request in ${delay}ms (${retries} retries left)`);
      }

      await this.sleep(delay);
      return this.request<T>(config, retries - 1);
    }

    // No more retries or non-retryable error
    if (!statusCode) {
      throw new NetworkError(error.message, error);
    }

    throw new APIError(
      this.getErrorMessage(error),
      statusCode,
      error.response?.data
    );
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}
