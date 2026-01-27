import { CaspitClient } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Example demonstrating client management operations
 */
async function main() {
  const client = new CaspitClient({
    username: process.env.CASPIT_USERNAME!,
    password: process.env.CASPIT_PASSWORD!,
    organizationId: process.env.CASPIT_ORGANIZATION_ID!,
  });

  try {
    // Create a new business client
    console.log('Creating business client...');
    const businessClient = await client.clients.create({
      name: 'Acme Corporation',
      type: 1, // Business
      taxId: '123456789',
      email: 'contact@acme.com',
      phone: '03-1234567',
      address: '456 Business Ave',
      city: 'Tel Aviv',
      postalCode: '12345',
      country: 'Israel',
      contactPerson: 'Jane Smith',
      notes: 'VIP Client',
    });
    console.log('Business client created:', businessClient.id);

    // Get client details
    console.log('\nFetching client details...');
    const clientDetails = await client.clients.get(businessClient.id!);
    console.log('Client details:', clientDetails);

    // Update client information
    console.log('\nUpdating client...');
    const updatedClient = await client.clients.update(businessClient.id!, {
      phone: '03-9876543',
      notes: 'VIP Client - Updated contact info',
    });
    console.log('Client updated:', updatedClient.phone);

    // Search clients by email domain
    console.log('\nSearching clients by email...');
    const searchResults = await client.clients.search('acme.com');
    console.log(`Found ${searchResults.length} clients with acme.com domain`);

    // List all active clients
    console.log('\nListing active clients...');
    const activeClients = await client.clients.list({
      active: true,
      limit: 50,
    });
    console.log(`Total active clients: ${activeClients.total}`);

    // List clients with pagination
    console.log('\nListing clients with pagination...');
    const page1 = await client.clients.list({ page: 1, limit: 10 });
    console.log(`Page 1: ${page1.data.length} clients`);

    const page2 = await client.clients.list({ page: 2, limit: 10 });
    console.log(`Page 2: ${page2.data.length} clients`);

    // Delete client (optional - uncomment if needed)
    // console.log('\nDeleting client...');
    // await client.clients.delete(businessClient.id!);
    // console.log('Client deleted successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
