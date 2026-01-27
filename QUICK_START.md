# Caspit API - Quick Start Guide

## ✅ Build Status

The project has been successfully built and all tests pass!

## 📂 Project Structure

```
caspit-api/
├── dist/                      # Built files (CommonJS + ESM)
│   ├── index.js              # CommonJS build
│   ├── index.mjs             # ES Modules build
│   ├── index.d.ts            # TypeScript declarations
│   └── source maps
├── src/
│   ├── caspit-client.ts      # Main client class
│   ├── managers/
│   │   ├── clients-manager.ts    # Client CRUD operations
│   │   └── documents-manager.ts  # Document operations
│   ├── types/                # TypeScript types
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── config.ts
│   │   ├── document.ts
│   │   └── error.ts
│   └── utils/
│       ├── auth-manager.ts   # Token management
│       └── http-client.ts    # HTTP with retry logic
├── examples/                 # 4 complete examples
├── tests/unit/              # Unit tests
└── Configuration files
```

## 🚀 Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables (for examples):**
   ```bash
   cp .env.example .env
   # Edit .env with your Caspit credentials
   ```

   See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed instructions.

3. **Build the library:**
   ```bash
   npm run build
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## 💻 Basic Usage

### Initialize the Client

#### Using Environment Variables (Recommended for examples)

```typescript
import { CaspitClient, DocumentType } from './src';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new CaspitClient({
  username: process.env.CASPIT_USERNAME!,
  password: process.env.CASPIT_PASSWORD!,
  organizationId: process.env.CASPIT_ORGANIZATION_ID!,
  debug: process.env.CASPIT_DEBUG === 'true'
});
```

#### Using Direct Credentials

```typescript
import { CaspitClient, DocumentType } from './src';

const client = new CaspitClient({
  username: 'your-username',
  password: 'your-password',
  organizationId: 'your-org-id',
  debug: true
});
```

### Working with Clients

```typescript
// List clients
const clients = await client.clients.list({ limit: 10 });

// Search for a client
const results = await client.clients.search('John Doe');

// Create a client
const newClient = await client.clients.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '050-1234567',
  type: 2, // 1=Business, 2=Individual
});

// Update a client
await client.clients.update(newClient.id!, {
  phone: '050-9876543'
});

// Get a single client
const client = await client.clients.get('client-id');
```

### Creating Documents

```typescript
// Create an invoice
const invoice = await client.documents.create({
  type: DocumentType.INVOICE,
  clientId: 'client-id',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  items: [
    {
      description: 'Web Development Services',
      quantity: 10,
      price: 500,
      vatRate: 17,
    }
  ],
  currency: 'ILS',
  language: 'he',
  notes: 'Thank you for your business!'
});

console.log('Invoice created:', invoice.documentNumber);
console.log('Total:', invoice.total);

// Send invoice by email
await client.documents.sendEmail(invoice.id!, {
  subject: 'Your Invoice',
  body: 'Please find attached your invoice.'
});

// Get PDF URL
const pdfUrl = await client.documents.getPdfUrl(invoice.id!);
```

## 📋 Document Types

```typescript
DocumentType.INVOICE          // חשבונית מס (1)
DocumentType.RECEIPT          // קבלה (2)
DocumentType.INVOICE_RECEIPT  // חשבונית מס קבלה (3)
DocumentType.DELIVERY_NOTE    // תעודת משלוח (4)
DocumentType.QUOTE            // הצעת מחיר (5)
DocumentType.PROFORMA         // חשבונית עסקה (6)
DocumentType.CREDIT           // חשבונית זיכוי (7)
DocumentType.RETURN           // הזמנת החזרה (8)
```

## 🔐 Authentication

Authentication is handled automatically:

```typescript
// Test connection
const isConnected = await client.testConnection();
console.log('Connected:', isConnected);

// Force refresh token
await client.refreshToken();

// Clear cached token
client.clearToken();
```

## ⚠️ Error Handling

```typescript
import {
  AuthenticationError,
  ValidationError,
  APIError,
  NetworkError,
  RateLimitError,
} from './src';

try {
  await client.clients.create({ name: '' });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
    console.error('Field:', error.field);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed');
  } else if (error instanceof APIError) {
    console.error('API error:', error.statusCode, error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter);
  }
}
```

## 📚 Complete Examples

All examples use environment variables for credentials. Make sure you've set up your `.env` file first (see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)).

Run the example files to see the library in action:

1. **Basic Usage:**
   ```bash
   # Make sure .env is configured first!
   npx ts-node examples/basic-usage.ts
   ```

2. **Client Management:**
   ```bash
   npx ts-node examples/client-management.ts
   ```

3. **Document Creation:**
   ```bash
   npx ts-node examples/document-creation.ts
   ```

4. **Create Check Receipt:**
   ```bash
   npx ts-node examples/create-check-receipt.ts
   ```

5. **Error Handling:**
   ```bash
   npx ts-node examples/error-handling.ts
   ```

## 🔧 Development Commands

```bash
npm run build         # Build the library
npm run dev           # Build in watch mode
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run lint          # Lint the code
npm run format        # Format the code
```

## 📦 Publishing to NPM

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Build and test:
   ```bash
   npm run build
   npm test
   ```
4. Publish:
   ```bash
   npm publish
   ```

## 🌐 API Documentation

For detailed Caspit API documentation:
https://app.caspit.biz/apihelp

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🤝 Similar Projects

- [GreenInvoiceAPI](https://github.com/g-and-s-tools/GreenInvoiceAPI) - TypeScript SDK for Green Invoice
