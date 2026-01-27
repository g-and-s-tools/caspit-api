import {
  CaspitClient,
  DocumentType,
  AuthenticationError,
  ValidationError,
  APIError,
  NetworkError,
  RateLimitError,
} from '../src';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Example demonstrating error handling
 */
async function main() {
  const client = new CaspitClient({
    username: process.env.CASPIT_USERNAME!,
    password: process.env.CASPIT_PASSWORD!,
    organizationId: process.env.CASPIT_ORGANIZATION_ID!,
  });

  try {
    // Example 1: Handle authentication errors
    console.log('Testing authentication...');
    const isConnected = await client.testConnection();

    if (!isConnected) {
      console.error('Failed to authenticate');
      return;
    }

    console.log('Authentication successful');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error('Authentication failed:', error.message);
      return;
    }
  }

  // Example 2: Handle validation errors
  try {
    console.log('\nTesting validation...');
    await client.clients.create({
      name: '', // Empty name - will fail validation
      email: 'invalid-email', // Invalid email format
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation error:', error.message);
      console.error('Field:', error.field);
    }
  }

  // Example 3: Handle API errors
  try {
    console.log('\nTesting API error...');
    await client.clients.get('non-existent-id');
  } catch (error) {
    if (error instanceof APIError) {
      console.error('API error:', error.message);
      console.error('Status code:', error.statusCode);
      console.error('Response:', error.response);
    }
  }

  // Example 4: Handle network errors
  try {
    console.log('\nTesting network error...');
    const offlineClient = new CaspitClient({
      username: 'test',
      password: 'test',
      organizationId: 'test',
      baseUrl: 'http://invalid-domain-that-does-not-exist.com',
      timeout: 5000,
    });
    await offlineClient.testConnection();
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error('Network error:', error.message);
      console.error('Original error:', error.originalError?.message);
    }
  }

  // Example 5: Handle rate limit errors
  try {
    console.log('\nTesting rate limit...');
    // Make many requests in quick succession
    const promises = Array.from({ length: 100 }, (_, i) =>
      client.clients.list({ limit: 1 }).catch((err) => {
        if (err instanceof RateLimitError) {
          console.log(`Rate limited! Retry after ${err.retryAfter} seconds`);
        }
        throw err;
      })
    );
    await Promise.all(promises);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.error('Rate limit exceeded:', error.message);
      console.error('Retry after:', error.retryAfter, 'seconds');
    }
  }

  // Example 6: Comprehensive error handling
  async function safeDocumentCreate() {
    try {
      const clients = await client.clients.list({ limit: 1 });

      if (clients.data.length === 0) {
        console.log('No clients available');
        return null;
      }

      const document = await client.documents.create({
        type: DocumentType.INVOICE,
        clientId: clients.data[0].id!,
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            description: 'Service',
            quantity: 1,
            price: 100,
            vatRate: 17,
          },
        ],
      });

      console.log('Document created successfully:', document.documentNumber);
      return document;
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error('Invalid document data:', error.message, `(field: ${error.field})`);
      } else if (error instanceof AuthenticationError) {
        console.error('Authentication failed. Please check credentials.');
      } else if (error instanceof APIError) {
        console.error(`API error (${error.statusCode}):`, error.message);
      } else if (error instanceof NetworkError) {
        console.error('Network error. Please check your connection.');
      } else if (error instanceof RateLimitError) {
        console.error(`Rate limited. Retry after ${error.retryAfter} seconds.`);
      } else {
        console.error('Unexpected error:', error);
      }
      return null;
    }
  }

  console.log('\nTesting comprehensive error handling...');
  await safeDocumentCreate();
}

main();
