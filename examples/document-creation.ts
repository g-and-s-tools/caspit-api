import { CaspitClient, DocumentType } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Example demonstrating document creation and management
 */
async function main() {
  const client = new CaspitClient({
    username: process.env.CASPIT_USERNAME!,
    password: process.env.CASPIT_PASSWORD!,
    organizationId: process.env.CASPIT_ORGANIZATION_ID!,
  });

  try {
    // First, get or create a client
    console.log('Fetching clients...');
    const clients = await client.clients.list({ limit: 1 });

    if (clients.data.length === 0) {
      console.error('No clients found. Please create a client first.');
      return;
    }

    const clientId = clients.data[0].id!;
    console.log(`Using client: ${clients.data[0].name} (${clientId})`);

    // Create a tax invoice
    console.log('\nCreating tax invoice...');
    const invoice = await client.documents.create({
      type: DocumentType.INVOICE,
      clientId,
      date: '2024-01-15',
      dueDate: '2024-02-15',
      items: [
        {
          description: 'Product A',
          quantity: 5,
          price: 100,
          vatRate: 17,
        },
        {
          description: 'Product B',
          quantity: 3,
          price: 200,
          vatRate: 17,
          discount: 10, // 10% discount
        },
      ],
      currency: 'ILS',
      language: 'he',
      notes: 'Payment terms: Net 30',
      footer: 'Thank you for your business!',
      includeVat: true,
    });
    console.log('Invoice created:', invoice.documentNumber);
    console.log(`Subtotal: ${invoice.subtotal} ${invoice.currency}`);
    console.log(`VAT: ${invoice.vatAmount} ${invoice.currency}`);
    console.log(`Total: ${invoice.total} ${invoice.currency}`);

    // Create a quote
    console.log('\nCreating quote...');
    const quote = await client.documents.create({
      type: DocumentType.QUOTE,
      clientId,
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          description: 'Consulting Services - Phase 1',
          quantity: 40,
          price: 500,
          vatRate: 17,
        },
        {
          description: 'Consulting Services - Phase 2',
          quantity: 60,
          price: 450,
          vatRate: 17,
        },
      ],
      currency: 'USD',
      language: 'en',
      notes: 'Quote valid for 30 days',
    });
    console.log('Quote created:', quote.documentNumber);

    // Create a receipt
    console.log('\nCreating receipt...');
    const receipt = await client.documents.create({
      type: DocumentType.RECEIPT,
      clientId,
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          description: 'Payment received for Invoice #123',
          quantity: 1,
          price: 1500,
          vatRate: 0,
        },
      ],
      currency: 'ILS',
      language: 'he',
    });
    console.log('Receipt created:', receipt.documentNumber);

    // List documents for a client
    console.log('\nListing documents for client...');
    const documents = await client.documents.list({
      clientId,
      limit: 10,
    });
    console.log(`Found ${documents.length} documents for this client`);

    // Get document details
    console.log('\nFetching invoice details...');
    const invoiceDetails = await client.documents.get(invoice.id!);
    console.log('Invoice details:', {
      number: invoiceDetails.documentNumber,
      total: invoiceDetails.total,
      url: invoiceDetails.url,
    });

    // Send document by email
    console.log('\nSending invoice by email...');
    await client.documents.sendEmail(invoice.id!, {
      subject: `Invoice ${invoice.documentNumber}`,
      body: 'Dear Customer,\n\nPlease find attached your invoice.\n\nBest regards',
    });
    console.log('Invoice sent successfully');

    // Get PDF URL
    const pdfUrl = await client.documents.getPdfUrl(invoice.id!);
    console.log('\nPDF URL:', pdfUrl);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
