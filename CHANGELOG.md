# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-27

### Added
- Receipt payment lines support (`ReceiptLine` interface)
  - Create receipts for check payments, credit cards, cash, etc.
  - Full support for payment details (bank, branch, account, check number, payment date)
  - PaymentTypeId support (1 = Cash, 2 = Check, 3-8 = Credit Cards, 9 = Bank Transfer)
- Payment amount fields in DocumentResponse
  - `payment` - Single payment amount
  - `totalPayment` - Total of all payment lines
- New `findByTaxId()` method in ClientsManager
  - Find clients by Tax ID (OsekMorshe) using the specific API endpoint with `d=1` parameter (per Caspit FAQ)
  - Returns exact match for the specified Tax ID
  - Gracefully handles 404 errors by returning empty array (no exception thrown)
  - More precise than general search for tax ID lookups

### Fixed
- Receipt total amount now displays correctly for payment-only receipts
  - Previously showed ₪0 for receipts with only ReceiptLines
  - Now correctly uses TotalPayment field from API response
- Document creation validation updated to allow either items OR receiptLines
- Corrected payment type ID for checks from 9 to 2
- Added checkNumber field to receipt lines for proper check tracking

### Changed
- Documents can now be created with either `items` (DocumentLines) or `receiptLines` (ReceiptLines)
- Updated create-check-receipt.ts example to use ReceiptLines instead of items

## [1.0.0] - 2024-01-27

### Added
- Initial release of Caspit API TypeScript SDK
- Authentication with automatic token management and refresh
- Client management (CRUD operations)
  - Create, read, update, delete clients
  - Search and list clients with pagination
  - Full validation support
- Document management
  - Create invoices, receipts, quotes, and other document types
  - Get, list, update, delete documents
  - Send documents via email
  - Generate PDF URLs
- Comprehensive error handling
  - AuthenticationError
  - ValidationError
  - APIError
  - NetworkError
  - RateLimitError
- HTTP client with retry logic and exponential backoff
- Full TypeScript support with type definitions
- Debug mode for troubleshooting
- Dual package support (CommonJS and ES Modules)
- Complete documentation and examples

### Features
- Automatic retry with exponential backoff for transient errors
- Token caching and automatic refresh
- Input validation with helpful error messages
- Configurable timeout and retry settings
- Support for both JSON and XML response formats
