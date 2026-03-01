import { CaspitClient } from '../src';
import * as dotenv from 'dotenv';
import * as https from 'https';

dotenv.config();

// Usage: npx ts-node examples/test-pdf-url.ts <documentId>
// Example: npx ts-node examples/test-pdf-url.ts 0fe89b0a-cca1-45d3-92ef-bed13784ee9c

async function main() {
   const documentId = process.argv[2];
   if (!documentId) {
      console.error('Usage: npx ts-node examples/test-pdf-url.ts <documentId>');
      process.exit(1);
   }

   const client = new CaspitClient({
      username: process.env.CASPIT_USERNAME!,
      password: process.env.CASPIT_PASSWORD!,
      organizationId: process.env.CASPIT_ORGANIZATION_ID!,
   });

   console.log('Getting PDF URL for document:', documentId);
   const url = await client.documents.getPdfUrl(documentId);
   console.log('PDF URL:', url);

   // Verify the URL actually returns a PDF (check Content-Type)
   console.log('\nChecking URL response headers...');
   await new Promise<void>((resolve, reject) => {
      https.get(url, res => {
         console.log('Status:', res.statusCode);
         console.log('Content-Type:', res.headers['content-type']);
         const isPdf = res.headers['content-type']?.includes('pdf');
         console.log(isPdf ? '✓ URL returns a PDF' : '✗ URL does NOT return a PDF');
         res.destroy();
         resolve();
      }).on('error', reject);
   });
}

main().catch(err => {
   console.error('Error:', err.message);
   process.exit(1);
});
