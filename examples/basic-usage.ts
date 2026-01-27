import { CaspitClient, DocumentType } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Basic usage example for Caspit API
 */
async function main() {
  // Initialize the client with credentials from environment variables
  const client = new CaspitClient({
    username: process.env.CASPIT_USERNAME!,
    password: process.env.CASPIT_PASSWORD!,
    organizationId: process.env.CASPIT_ORGANIZATION_ID!,
    debug: process.env.CASPIT_DEBUG === 'true', // Enable debug logging
  });

  try {
    // Test connection
    console.log('Testing connection...');
    const isConnected = await client.testConnection();
    console.log('Connection test:', isConnected ? 'SUCCESS' : 'FAILED');

    // List all clients
    console.log('\nListing clients...');
    const clientsList = await client.clients.list({ limit: 10 });
    console.log(`Found ${clientsList.data.length} clients`);
    clientsList.data.forEach((c) => {
      console.log(`- ${c.name} (${c.email})`);
    });

    // Search for a specific client
    console.log('\nSearching for client...');
    const searchResults = await client.clients.search('John');
    console.log(`Found ${searchResults.length} clients matching "John"`);

    // Create a new client
    console.log('\nCreating a new client...');
    const newClient = await client.clients.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '050-1234567',
      type: 2, // Individual
      address: '123 Main St',
      city: 'Tel Aviv',
    });
    console.log('Client created:', newClient.id);

    // Create an invoice document
    console.log('\nCreating an invoice...');
    const invoice = await client.documents.create({
      type: DocumentType.INVOICE,
      clientId: newClient.id!,
      date: new Date().toISOString().split('T')[0], // Today's date
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      items: [
        {
          description: 'Web Development Services',
          quantity: 10,
          price: 500,
          vatRate: 17,
        },
        {
          description: 'Consulting',
          quantity: 5,
          price: 300,
          vatRate: 17,
        },
      ],
      currency: 'ILS',
      language: 'he',
      notes: 'Thank you for your business!',
    });
    console.log('Invoice created:', invoice.documentNumber);
    console.log('Total amount:', invoice.total);

    // Get PDF URL
    const pdfUrl = await client.documents.getPdfUrl(invoice.id!);
    console.log('PDF URL:', pdfUrl);

    // Send invoice by email
    console.log('\nSending invoice by email...');
    await client.documents.sendEmail(invoice.id!, {
      subject: 'Your Invoice',
      body: 'Please find attached your invoice.',
    });
    console.log('Invoice sent successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
