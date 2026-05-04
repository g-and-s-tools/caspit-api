/**
 * Document types in Caspit
 */
export enum DocumentType {
  /**
   * Invoice (חשבונית מס)
   */
  INVOICE = 1,

  /**
   * Receipt (קבלה)
   */
  RECEIPT = 2,

  /**
   * Tax Invoice/Receipt (חשבונית מס קבלה)
   */
  INVOICE_RECEIPT = 3,

  /**
   * Delivery Note (תעודת משלוח)
   */
  DELIVERY_NOTE = 4,

  /**
   * Quote (הצעת מחיר)
   */
  QUOTE = 5,

  /**
   * Proforma Invoice (חשבונית עסקה)
   */
  PROFORMA = 6,

  /**
   * Credit Invoice (חשבונית זיכוי)
   */
  CREDIT = 7,

  /**
   * Return Order (הזמנת החזרה)
   */
  RETURN = 8,
}

/**
 * Document item/line
 */
export interface DocumentItem {
  /**
   * Item description
   */
  description: string;

  /**
   * Quantity
   */
  quantity: number;

  /**
   * Unit price
   */
  price: number;

  /**
   * VAT rate (percentage)
   * @default 17
   */
  vatRate?: number;

  /**
   * Discount percentage
   */
  discount?: number;

  /**
   * Item notes
   */
  notes?: string;

  /**
   * Currency code (ILS, USD, EUR, etc.)
   * @default 'ILS'
   */
  currency?: string;
}

/**
 * Receipt payment line (check, credit card, cash, etc.)
 */
export interface ReceiptLine {
  /**
   * Line number
   */
  number?: number;

  /**
   * Payment type ID
   * Common values: 1 = Cash, 2 = Check, 3-8 = Credit Cards, 9 = Bank Transfer
   * See PaymentTypes in Caspit API
   */
  paymentTypeId: number;

  /**
   * Check number or credit card number
   */
  accountNumber?: string;

  /**
   * Bank branch or credit card expiry date
   */
  branchOrValidTo?: string;

  /**
   * Bank ID (for checks)
   */
  bankId?: number;

  /**
   * Check number
   */
  checkNumber?: string;

  /**
   * Payment date or check date
   */
  paymentDate?: string;

  /**
   * Payment amount
   */
  payment: number;
}

/**
 * Caspit Document interface
 */
export interface CaspitDocument {
  /**
   * Document ID (internal Caspit ID)
   */
  id?: string;

  /**
   * Document number
   */
  documentNumber?: string;

  /**
   * Document type
   */
  type: DocumentType;

  /**
   * Client ID
   */
  clientId: string;

  /**
   * Document date (ISO 8601 format)
   */
  date: string;

  /**
   * Due date (ISO 8601 format)
   */
  dueDate?: string;

  /**
   * Document items/lines
   */
  items: DocumentItem[];

  /**
   * Currency code
   * @default 'ILS'
   */
  currency?: string;

  /**
   * Language (he, en)
   * @default 'he'
   */
  language?: 'he' | 'en';

  /**
   * Additional notes
   */
  notes?: string;

  /**
   * Footer text
   */
  footer?: string;

  /**
   * Include VAT in calculations
   * @default true
   */
  includeVat?: boolean;

  /**
   * Email the document to the client
   */
  sendEmail?: boolean;

  /**
   * Email subject
   */
  emailSubject?: string;

  /**
   * Email body
   */
  emailBody?: string;
}

/**
 * Request payload for creating a document
 */
export interface CreateDocumentRequest {
  type: DocumentType;
  customerId: string;
  customerName?: string;
  customerTaxId?: string;
  date: string;
  dueDate?: string;
  items?: DocumentItem[];
  receiptLines?: ReceiptLine[];
  currency?: string;
  language?: 'he' | 'en';
  notes?: string;
  footer?: string;
  includeVat?: boolean;
  sendEmail?: boolean;
  emailSubject?: string;
  emailBody?: string;
}

/**
 * Document response after creation
 */
export interface DocumentResponse extends CaspitDocument {
  /**
   * Document URL for viewing/downloading
   */
  url?: string;

  /**
   * PDF URL
   */
  pdfUrl?: string;

  /**
   * Total amount before VAT
   */
  subtotal?: number;

  /**
   * VAT amount
   */
  vatAmount?: number;

  /**
   * Total amount including VAT
   */
  total?: number;

  /**
   * Payment amount (for receipts)
   */
  payment?: number;

  /**
   * Total payment amount (for receipts with multiple payment lines)
   */
  totalPayment?: number;

  /**
   * Creation timestamp
   */
  createdAt?: string;

  /**
   * Last update timestamp
   */
  updatedAt?: string;
}
