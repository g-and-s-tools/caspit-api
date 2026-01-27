/**
 * Base error class for Caspit API errors
 */
export class CaspitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaspitError';
    Object.setPrototypeOf(this, CaspitError.prototype);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends CaspitError {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Validation error for invalid input
 */
export class ValidationError extends CaspitError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * API error with status code
 */
export class APIError extends CaspitError {
  public readonly statusCode: number;
  public readonly response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Network error for connection issues
 */
export class NetworkError extends CaspitError {
  public readonly originalError?: Error;

  constructor(message: string = 'Network request failed', originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends CaspitError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
