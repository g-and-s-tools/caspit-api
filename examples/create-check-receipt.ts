import { CaspitClient, DocumentType, CaspitClient as ClientType } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Check object interface
 */
interface Check {
  checkNumber: string;
  bank: string;
  branch: string;
  account: string;
  date: string;
  amount: number;
}

/**
 * Create a receipt for checks payment
 */
async function createCheckReceipt(
  client: CaspitClient,
  taxId: string,
  checks: Check[]
): Promise<void> {
  try {
    // Find client by tax ID using the specific findByTaxId method
    console.log(`\nSearching for client with Tax ID: ${taxId}...`);
    const clients = await client.clients.findByTaxId(taxId);

    if (clients.length === 0) {
      throw new Error(`Client with Tax ID ${taxId} not found`);
    }

    // Get the first matching client
    const targetClient = clients[0];
    console.log(`Found client: ${targetClient.name} (ID: ${targetClient.id})`);

    // Calculate total amount from all checks
    const totalAmount = checks.reduce((sum, check) => sum + check.amount, 0);

    // Create receipt lines - one for each check
    // PaymentTypeId 2 = Check payment
    const receiptLines = checks.map((check, index) => ({
      number: index + 1,
      paymentTypeId: 2, // 2 = Check payment
      checkNumber: check.checkNumber,
      accountNumber: check.account,
      branchOrValidTo: check.branch,
      bankId: parseInt(check.bank),
      paymentDate: check.date,
      payment: check.amount,
    }));

    console.log(`\nCreating receipt for ${checks.length} check(s), total amount: ₪${totalAmount}...`);
    console.log('Receipt lines:', receiptLines);

    // Create the receipt
    const receipt = await client.documents.create({
      type: DocumentType.RECEIPT,
      customerId: targetClient.id!,
      date: '2024-02-01', // Use a date from 2024 to match the check dates
      receiptLines,
      currency: 'ILS',
      language: 'he',
      notes: `Payment received via ${checks.length} check(s)`,
      includeVat: false,
    });

    console.log(`✓ Receipt created successfully!`);
    console.log(`  Document Number: ${receipt.documentNumber}`);
    console.log(`  Total Amount: ₪${receipt.total}`);
    console.log(`  Client: ${targetClient.name}`);

    if (receipt.url) {
      console.log(`  URL: ${receipt.url}`);
    }

    // Get PDF URL
    const pdfUrl = await client.documents.getPdfUrl(receipt.id!);
    console.log(`  PDF: ${pdfUrl}`);

  } catch (error) {
    if (error instanceof Error) {
      console.error(`✗ Error creating receipt: ${error.message}`);
      throw error;
    }
    throw error;
  }
}

/**
 * Main example - Get clients, choose one randomly, and create a check receipt
 */
async function main() {
  const caspitClient = new CaspitClient({
    username: process.env.CASPIT_USERNAME!,
    password: process.env.CASPIT_PASSWORD!,
    organizationId: process.env.CASPIT_ORGANIZATION_ID!,
    debug: process.env.CASPIT_DEBUG === 'true',
  });

  try {
    // Test connection
    console.log('Testing connection...');
    const isConnected = await caspitClient.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Caspit API');
    }
    console.log('✓ Connected successfully\n');

    // Get 50 clients
    console.log('Fetching 50 clients...');
    const clientsList = await caspitClient.clients.list({ limit: 50 });

    if (clientsList.data.length === 0) {
      console.error('No clients found in the system');
      return;
    }

    console.log(`✓ Found ${clientsList.data.length} clients`);

    // Filter clients that have a tax ID
    const clientsWithTaxId = clientsList.data.filter(c => c.taxId && c.taxId.trim().length > 0);

    if (clientsWithTaxId.length === 0) {
      console.error('No clients with Tax ID found');
      console.log('\nCreating a test client with Tax ID...');

      // Create a test client with tax ID
      const testClient = await caspitClient.clients.create({
        name: 'Test Client for Check Receipt',
        type: 1, // Business
        taxId: '123456789',
        email: 'test@example.com',
        phone: '050-1234567',
        address: '123 Test St',
        city: 'Tel Aviv',
      });

      console.log(`✓ Created test client: ${testClient.name} (Tax ID: ${testClient.taxId})`);
      clientsWithTaxId.push(testClient);
    }

    // Choose a random client with tax ID
    const randomIndex = Math.floor(Math.random() * clientsWithTaxId.length);
    const randomClient = clientsWithTaxId[randomIndex];

    console.log(`\n🎲 Randomly selected client:`);
    console.log(`   Name: ${randomClient.name}`);
    console.log(`   Tax ID: ${randomClient.taxId}`);
    console.log(`   Email: ${randomClient.email || 'N/A'}`);

    // Create sample checks
    const sampleChecks: Check[] = [
      {
        checkNumber: '1001',
        bank: '10',
        branch: '001',
        account: '123456',
        date: '2024-01-15',
        amount: 5000,
      },
      {
        checkNumber: '1002',
        bank: '12',
        branch: '002',
        account: '789012',
        date: '2024-01-20',
        amount: 3500,
      },
      {
        checkNumber: '1003',
        bank: '11',
        branch: '003',
        account: '345678',
        date: '2024-01-25',
        amount: 2000,
      },
    ];

    console.log(`\n📝 Sample checks to process:`);
    sampleChecks.forEach((check, index) => {
      console.log(`   Check ${index + 1}: Bank ${check.bank}, Branch ${check.branch}, ₪${check.amount}, Date: ${check.date}`);
    });

    // Create the check receipt
    await createCheckReceipt(caspitClient, randomClient.taxId!, sampleChecks);

    console.log('\n✓ Example completed successfully!');

    // Additional example: Error handling - try with non-existent tax ID
    console.log('\n\n--- Testing error handling with non-existent Tax ID ---');
    try {
      await createCheckReceipt(caspitClient, '999999999', [
        {
          checkNumber: '9999',
          bank: '10',
          branch: '001',
          account: '111111',
          date: '2024-01-30',
          amount: 1000,
        },
      ]);
    } catch (error) {
      console.log('✓ Error handled correctly:', (error as Error).message);
    }

  } catch (error) {
    console.error('\n✗ Error:', error);
    process.exit(1);
  }
}

// Run the example
main();
