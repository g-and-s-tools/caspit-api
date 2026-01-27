/**
 * Caspit API TypeScript SDK
 *
 * A comprehensive TypeScript library for interacting with the Caspit API.
 * Supports authentication, client management, and document creation.
 *
 * @packageDocumentation
 */

// Main client
export { CaspitClient } from './caspit-client';

// Types
export * from './types';

// Managers
export { ClientsManager, DocumentsManager } from './managers';

// Utilities (exported for advanced use cases)
export { HttpClient, AuthManager } from './utils';
