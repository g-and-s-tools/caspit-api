# Caspit API Examples

This directory contains complete working examples demonstrating various features of the Caspit API library.

## Prerequisites

Before running any examples, make sure you have:

1. **Installed dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Caspit credentials
   ```

   See [../ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) for detailed setup instructions.

3. **Built the library:**
   ```bash
   npm run build
   ```

## ✅ All Examples Work

**All examples are fully functional with a real Caspit account:**

- ✅ **[client-management.ts](./client-management.ts)** - Complete client lifecycle
- ✅ **[document-creation.ts](./document-creation.ts)** - Create invoices, quotes, receipts
- ✅ **[create-check-receipt.ts](./create-check-receipt.ts)** - Process check payments
- ✅ **[basic-usage.ts](./basic-usage.ts)** - Quick start guide
- ✅ **[error-handling.ts](./error-handling.ts)** - Error handling patterns

**Note**: The demo account (username: `demo`) may have limitations. Use your own Caspit account credentials for full functionality.

## Available Examples

### 1. Basic Usage ([basic-usage.ts](./basic-usage.ts))

**What it does:**
- Tests API connection
- Lists clients
- Searches for specific clients
- Creates a new client
- Creates an invoice with multiple items
- Sends invoice via email
- Gets PDF URL

**Run:**
```bash
npx ts-node examples/basic-usage.ts
```

**Key concepts:**
- Client initialization with environment variables
- Authentication testing
- Basic CRUD operations
- Document creation
- Email functionality

---

### 2. Client Management ([client-management.ts](./client-management.ts))

**What it does:**
- Creates a business client with full details
- Fetches client details by ID
- Updates client information
- Searches clients by email domain
- Lists active clients with pagination

**Run:**
```bash
npx ts-node examples/client-management.ts
```

**Key concepts:**
- Complete client lifecycle management
- Search and filtering
- Pagination handling
- Business vs Individual client types

---

### 3. Document Creation ([document-creation.ts](./document-creation.ts))

**What it does:**
- Creates a tax invoice with multiple items and discounts
- Creates a quote in USD
- Creates a receipt
- Lists documents for a client
- Fetches document details
- Sends document by email
- Gets PDF download URL

**Run:**
```bash
npx ts-node examples/document-creation.ts
```

**Key concepts:**
- Different document types (Invoice, Quote, Receipt)
- Multi-currency support
- Item-level discounts and VAT
- Document metadata (notes, footer)
- Email delivery

---

### 4. Create Check Receipt ([create-check-receipt.ts](./create-check-receipt.ts)) ⭐ NEW

**What it does:**
- Fetches 50 clients from the system
- Randomly selects a client with Tax ID
- Creates sample check objects (check number, bank, branch, account, date, amount)
- Finds client by Tax ID
- Creates a receipt for multiple checks using PaymentTypeId 2 (Check)
- Handles errors for non-existent Tax IDs

**Run:**
```bash
npx ts-node examples/create-check-receipt.ts
```

**Key concepts:**
- Finding clients by Tax ID using `findByTaxId()` method
- Creating receipts for check payments (PaymentTypeId: 2)
- Multiple payment items in one receipt with check numbers
- Random client selection
- Error handling for missing clients

**Use case:** Perfect for automating check payment processing workflows.

---

### 5. Error Handling ([error-handling.ts](./error-handling.ts))

**What it does:**
- Demonstrates authentication error handling
- Shows validation error handling with field information
- Handles API errors with status codes
- Demonstrates network error handling
- Shows rate limiting error handling
- Provides a comprehensive error handling pattern

**Run:**
```bash
npx ts-node examples/error-handling.ts
```

**Key concepts:**
- All error types (AuthenticationError, ValidationError, APIError, NetworkError, RateLimitError)
- Error-specific properties (field, statusCode, retryAfter)
- Best practices for error handling
- Graceful degradation

---

## Example Structure

All examples follow this pattern:

```typescript
import { CaspitClient } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Initialize client
  const client = new CaspitClient({
    username: process.env.CASPIT_USERNAME!,
    password: process.env.CASPIT_PASSWORD!,
    organizationId: process.env.CASPIT_ORGANIZATION_ID!,
  });

  try {
    // Example code here
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Running with Debug Mode

To see detailed API requests and responses, enable debug mode in your `.env`:

```env
CASPIT_DEBUG=true
```

Then run any example:

```bash
npx ts-node examples/basic-usage.ts
```

You'll see output like:
```
[Caspit API] Authenticating...
[Caspit API] GET /token
[Caspit API] Response: { status: 200, data: '...' }
```

## Common Issues

### "AuthenticationError: Failed to authenticate"
- Check your credentials in `.env`
- Verify your organization ID is correct
- Try the demo account first (username: `demo`, password: `demodemo`)

### "Cannot read properties of undefined"
- Make sure you've built the library: `npm run build`
- Check that your `.env` file exists and has all required variables

### "Client with Tax ID not found"
- The client might not have a Tax ID set
- Try creating a client with a Tax ID first
- See [create-check-receipt.ts](./create-check-receipt.ts) for an example

## Creating Your Own Examples

1. Copy an existing example as a template
2. Modify the logic for your use case
3. Add appropriate error handling
4. Test with the demo account first
5. Document what your example does

## Need Help?

- Check the main [README.md](../README.md) for API reference
- See [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) for environment configuration
- Review [QUICK_START.md](../QUICK_START.md) for quick reference
- Visit the [Caspit API documentation](https://app.caspit.biz/apihelp)

## Contributing

If you create a useful example, consider contributing it back to the repository!
