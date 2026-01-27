# Caspit API - TypeScript SDK

A comprehensive TypeScript library for interacting with the Caspit API. This SDK provides a simple and intuitive interface for authentication, client management, and document creation.

## Features

- 🔐 **Authentication** - Automatic token management with refresh
- 👥 **Client Management** - Search, create, update, and delete clients
- 📄 **Document Creation** - Create invoices, receipts, quotes, and more
- 🔄 **Automatic Retry** - Built-in retry logic with exponential backoff
- 📝 **Full TypeScript Support** - Complete type definitions
- ✅ **Validation** - Input validation with helpful error messages
- 🐛 **Debug Mode** - Optional debug logging
- 📦 **Dual Package** - Supports both CommonJS and ES Modules

## Installation

```bash
npm install caspit-api
```

## Environment Setup (For Examples)

If you want to run the included examples, set up your environment variables:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Caspit credentials:
   ```env
   CASPIT_USERNAME=your-username
   CASPIT_PASSWORD=your-password
   CASPIT_ORGANIZATION_ID=your-org-id
   ```

See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed setup instructions.

## ✅ Production Ready

This library is **fully functional** and ready for production use:

- ✅ **Authentication** - Automatic token management with refresh
- ✅ **Client Management** - Create, read, update, delete, search clients
- ✅ **Document Creation** - Create invoices, receipts, quotes, and more
- ✅ **Multi-currency Support** - ILS (₪), USD ($), EUR (€), GBP (£), AUD (A$)
- ✅ **Error Handling** - Comprehensive error types with helpful messages

**Note about Demo Account**: The demo account (username: `demo`) has data configuration issues and may not work for document creation. For testing, use your own Caspit account credentials.

## Quick Start

```typescript
import { CaspitClient, DocumentType } from 'caspit-api';

// Initialize the client
const client = new CaspitClient({
  username: 'your-username',
  password: 'your-password',
  organizationId: 'your-org-id',
});

// Search for clients
const clients = await client.clients.search('John');

// Create an invoice
const invoice = await client.documents.create({
  type: DocumentType.INVOICE,
  clientId: clients[0].id!,
  date: '2024-01-15',
  items: [
    {
      description: 'Web Development',
      quantity: 10,
      price: 500,
      vatRate: 17,
    },
  ],
});

console.log('Invoice created:', invoice.documentNumber);
```

## Configuration

```typescript
const client = new CaspitClient({
  username: 'your-username',        // Required: Caspit username
  password: 'your-password',        // Required: Caspit password
  organizationId: 'your-org-id',    // Required: Organization ID (osekmorshe)
  baseUrl: 'https://app.caspit.biz/api/v1', // Optional: API base URL
  timeout: 30000,                   // Optional: Request timeout (ms)
  maxRetries: 3,                    // Optional: Max retry attempts
  debug: false,                     // Optional: Enable debug logging
  format: 'json',                   // Optional: Response format ('json' or 'xml')
});
```

## Authentication

The SDK handles authentication automatically. The token is cached and refreshed when needed.

```typescript
// Test connection
const isConnected = await client.testConnection();

// Force token refresh
await client.refreshToken();

// Clear cached token
client.clearToken();
```

## Client Management

### List Clients

```typescript
// List all clients
const result = await client.clients.list();

// List with pagination
const page1 = await client.clients.list({ page: 1, limit: 20 });

// Filter by active status
const activeClients = await client.clients.list({ active: true });
```

### Search Clients

```typescript
const results = await client.clients.search('John Doe');
```

### Find Clients by Tax ID

Find a client by their Tax ID (OsekMorshe) with precise matching. This method returns the exact client with the specified Tax ID. Returns an empty array if no client is found (404 errors are handled gracefully):

```typescript
const clients = await client.clients.findByTaxId('123456789');

if (clients.length > 0) {
  console.log('Found client:', clients[0].name);
} else {
  console.log('No client found with this Tax ID');
}
```

### Get Client

```typescript
const client = await client.clients.get('client-id');
```

### Create Client

```typescript
const newClient = await client.clients.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '050-1234567',
  type: 2, // 1 = Business, 2 = Individual
  address: '123 Main St',
  city: 'Tel Aviv',
  taxId: '123456789',
});
```

### Update Client

```typescript
const updated = await client.clients.update('client-id', {
  phone: '050-9876543',
  email: 'newemail@example.com',
});
```

### Delete Client

```typescript
await client.clients.delete('client-id');
```

## Document Management

### Document Types

```typescript
enum DocumentType {
  INVOICE = 1,          // חשבונית מס
  RECEIPT = 2,          // קבלה
  INVOICE_RECEIPT = 3,  // חשבונית מס קבלה
  DELIVERY_NOTE = 4,    // תעודת משלוח
  QUOTE = 5,            // הצעת מחיר
  PROFORMA = 6,         // חשבונית עסקה
  CREDIT = 7,           // חשבונית זיכוי
  RETURN = 8,           // הזמנת החזרה
}
```

### Create Document

```typescript
const invoice = await client.documents.create({
  type: DocumentType.INVOICE,
  clientId: 'client-id',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  items: [
    {
      description: 'Product A',
      quantity: 5,
      price: 100,
      vatRate: 17,
      discount: 10, // Optional: discount percentage
    },
    {
      description: 'Product B',
      quantity: 3,
      price: 200,
      vatRate: 17,
    },
  ],
  currency: 'ILS',      // Default: 'ILS'
  language: 'he',       // 'he' or 'en'
  notes: 'Thank you!',
  footer: 'Payment terms: Net 30',
  includeVat: true,     // Default: true
});
```

### Create Receipt with Payment Lines

For receipts with payments (checks, credit cards, cash), use `receiptLines` instead of `items`:

```typescript
// Create a receipt for check payments
const receipt = await client.documents.create({
  type: DocumentType.RECEIPT,
  clientId: 'client-id',
  date: '2024-01-15',
  receiptLines: [
    {
      paymentTypeId: 2,         // 2 = Check payment
      checkNumber: '1001',      // Check number
      accountNumber: '123456',  // Bank account
      branchOrValidTo: '001',   // Bank branch
      bankId: 10,               // Bank ID
      paymentDate: '2024-01-15',
      payment: 5000,            // Payment amount
    },
    {
      paymentTypeId: 2,         // Another check
      checkNumber: '1002',
      accountNumber: '789012',
      branchOrValidTo: '002',
      bankId: 12,
      paymentDate: '2024-01-20',
      payment: 3500,
    },
  ],
  currency: 'ILS',
  language: 'he',
  notes: 'Payment received via check',
  includeVat: false,
});

console.log(`Receipt ${receipt.documentNumber}: ₪${receipt.totalPayment}`);
```

**Note**: Use `receiptLines` for payment information and `items` for product/service lines. A document can have either or both.

### Get Document

```typescript
const document = await client.documents.get('document-id');
```

### List Documents

```typescript
// List all documents
const documents = await client.documents.list();

// Filter by client
const clientDocs = await client.documents.list({ clientId: 'client-id' });

// Filter by type
const invoices = await client.documents.list({ type: DocumentType.INVOICE });

// Filter by date range
const recent = await client.documents.list({
  fromDate: '2024-01-01',
  toDate: '2024-01-31',
});
```

### Update Document

```typescript
const updated = await client.documents.update('document-id', {
  notes: 'Updated notes',
  dueDate: '2024-03-15',
});
```

### Delete Document

```typescript
await client.documents.delete('document-id');
```

### Send Document by Email

```typescript
await client.documents.sendEmail('document-id', {
  subject: 'Your Invoice',
  body: 'Please find attached your invoice.',
});
```

### Get PDF URL

```typescript
const pdfUrl = await client.documents.getPdfUrl('document-id');
console.log('Download PDF:', pdfUrl);
```

## Error Handling

The SDK provides specific error classes for different scenarios:

```typescript
import {
  AuthenticationError,
  ValidationError,
  APIError,
  NetworkError,
  RateLimitError,
} from 'caspit-api';

try {
  await client.clients.create({ name: '' }); // Invalid data
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
    console.error('Field:', error.field);
  } else if (error instanceof AuthenticationError) {
    console.error('Auth failed:', error.message);
  } else if (error instanceof APIError) {
    console.error('API error:', error.statusCode, error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter);
  }
}
```

## Examples

See the [examples](./examples) directory for complete working examples:

- [basic-usage.ts](./examples/basic-usage.ts) - Basic usage and authentication
- [client-management.ts](./examples/client-management.ts) - Client CRUD operations
- [document-creation.ts](./examples/document-creation.ts) - Creating various document types
- [create-check-receipt.ts](./examples/create-check-receipt.ts) - Create check receipts with random client selection
- [error-handling.ts](./examples/error-handling.ts) - Comprehensive error handling

**Note:** All examples use environment variables from a `.env` file. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for setup instructions.

To run an example:
```bash
# 1. Set up your .env file first
cp .env.example .env
# Edit .env with your credentials

# 2. Run the example
npx ts-node examples/basic-usage.ts
```

## API Reference

### CaspitClient

Main client class for interacting with the Caspit API.

#### Properties

- `clients: ClientsManager` - Client management operations
- `documents: DocumentsManager` - Document management operations

#### Methods

- `testConnection(): Promise<boolean>` - Test API connection
- `refreshToken(): Promise<void>` - Force token refresh
- `clearToken(): void` - Clear cached token
- `getConfig(): CaspitConfigInternal` - Get current configuration

### ClientsManager

Manages client/contact operations.

#### Methods

- `list(options?: ListClientsOptions): Promise<PaginatedResponse<CaspitClient>>`
- `get(clientId: string): Promise<CaspitClient>`
- `create(data: CreateClientRequest): Promise<CaspitClient>`
- `update(clientId: string, data: Partial<CreateClientRequest>): Promise<CaspitClient>`
- `delete(clientId: string): Promise<void>`
- `search(query: string, limit?: number): Promise<CaspitClient[]>`

### DocumentsManager

Manages document operations.

#### Methods

- `create(data: CreateDocumentRequest): Promise<DocumentResponse>`
- `get(documentId: string): Promise<DocumentResponse>`
- `list(options?: ListDocumentsOptions): Promise<DocumentResponse[]>`
- `update(documentId: string, data: Partial<CreateDocumentRequest>): Promise<DocumentResponse>`
- `delete(documentId: string): Promise<void>`
- `sendEmail(documentId: string, options?: EmailOptions): Promise<void>`
- `getPdfUrl(documentId: string): Promise<string>`

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import {
  CaspitClient,
  CaspitConfig,
  CaspitClient as ClientType,
  CreateClientRequest,
  CaspitDocument,
  CreateDocumentRequest,
  DocumentType,
  DocumentItem,
} from 'caspit-api';
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

## API Documentation

For detailed API documentation, visit: https://app.caspit.biz/apihelp

## Related Projects

- [GreenInvoiceAPI](https://github.com/g-and-s-tools/GreenInvoiceAPI) - Similar SDK for Green Invoice API
