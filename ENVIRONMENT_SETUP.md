# Environment Setup Guide

This guide will help you set up your environment variables for the Caspit API library and examples.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your credentials:**
   ```bash
   # Windows
   notepad .env

   # Mac/Linux
   nano .env
   # or
   vim .env
   ```

3. **Fill in your Caspit API credentials:**
   ```env
   # Required Credentials
   CASPIT_USERNAME=your-actual-username
   CASPIT_PASSWORD=your-actual-password
   CASPIT_ORGANIZATION_ID=your-actual-org-id

   # Optional Configuration
   CASPIT_BASE_URL=https://app.caspit.biz/api/v1
   CASPIT_DEBUG=false
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CASPIT_USERNAME` | Your Caspit username | `demo` |
| `CASPIT_PASSWORD` | Your Caspit password | `demodemo` |
| `CASPIT_ORGANIZATION_ID` | Your organization ID (osekmorshe) | `12345` |

### Optional Variables

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `CASPIT_BASE_URL` | API base URL | `https://app.caspit.biz/api/v1` | Any valid URL |
| `CASPIT_DEBUG` | Enable debug logging | `false` | `true` or `false` |

## Getting Your Credentials

1. **Username & Password**: Your Caspit login credentials
2. **Organization ID**: Contact Caspit support or find it in your account settings

### Demo Account

For testing, you can use the Caspit demo account:
```env
CASPIT_USERNAME=demo
CASPIT_PASSWORD=demodemo
CASPIT_ORGANIZATION_ID=<your-test-org-id>
```

## Security Best Practices

### ⚠️ IMPORTANT

- **Never commit the `.env` file to version control**
  - The `.env` file is already in `.gitignore`
  - Only commit `.env.example` with placeholder values

- **Keep credentials secure**
  - Don't share your `.env` file
  - Don't expose credentials in logs or error messages
  - Use different credentials for development and production

### Using in Production

For production deployments, use your platform's secure environment variable system:

#### Heroku
```bash
heroku config:set CASPIT_USERNAME=your-username
heroku config:set CASPIT_PASSWORD=your-password
heroku config:set CASPIT_ORGANIZATION_ID=your-org-id
```

#### AWS Lambda
Set environment variables in the Lambda function configuration.

#### Docker
```bash
docker run -e CASPIT_USERNAME=your-username \
           -e CASPIT_PASSWORD=your-password \
           -e CASPIT_ORGANIZATION_ID=your-org-id \
           your-image
```

#### Docker Compose
```yaml
environment:
  - CASPIT_USERNAME=${CASPIT_USERNAME}
  - CASPIT_PASSWORD=${CASPIT_PASSWORD}
  - CASPIT_ORGANIZATION_ID=${CASPIT_ORGANIZATION_ID}
```

## Troubleshooting

### Examples not working?

1. **Make sure you created the `.env` file:**
   ```bash
   ls -la .env
   ```

2. **Verify your credentials are correct:**
   ```bash
   # Check if variables are loaded (don't do this in production!)
   node -e "require('dotenv').config(); console.log(process.env.CASPIT_USERNAME)"
   ```

3. **Test your connection:**
   ```bash
   npx ts-node examples/basic-usage.ts
   ```

### Authentication Errors

If you get authentication errors:
- Double-check your username and password
- Verify your organization ID is correct
- Ensure there are no extra spaces in the `.env` file
- Try using the demo account first to test

### Debug Mode

Enable debug mode to see detailed API requests and responses:
```env
CASPIT_DEBUG=true
```

Then run any example:
```bash
npx ts-node examples/basic-usage.ts
```

You'll see detailed logs like:
```
[Caspit API] Authenticating...
[Caspit API] GET /token
[Caspit API] Response: { status: 200, data: ... }
```

## Example Usage in Code

### Using dotenv in your own code

```typescript
import { CaspitClient } from 'caspit-api';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create client using environment variables
const client = new CaspitClient({
  username: process.env.CASPIT_USERNAME!,
  password: process.env.CASPIT_PASSWORD!,
  organizationId: process.env.CASPIT_ORGANIZATION_ID!,
  debug: process.env.CASPIT_DEBUG === 'true',
});

// Use the client
async function main() {
  const isConnected = await client.testConnection();
  console.log('Connected:', isConnected);
}

main();
```

### Without dotenv (direct usage)

If you don't want to use `.env` files:

```typescript
import { CaspitClient } from 'caspit-api';

const client = new CaspitClient({
  username: 'your-username',
  password: 'your-password',
  organizationId: 'your-org-id',
});
```

## Need Help?

- Check the [README.md](README.md) for general documentation
- See [QUICK_START.md](QUICK_START.md) for quick reference
- Review [examples/](examples/) for working code samples
- Visit the [Caspit API documentation](https://app.caspit.biz/apihelp)
