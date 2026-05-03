import { HttpClient } from '../utils/http-client';
import { AuthManager } from '../utils/auth-manager';
import {
  CreateDocumentRequest,
  DocumentResponse,
  DocumentType,
  CaspitDocument,
} from '../types/document';
import { ValidationError } from '../types/error';

/**
 * Manager for document operations
 */
export class DocumentsManager {
  constructor(
    private httpClient: HttpClient,
    private authManager: AuthManager
  ) {}

  /**
   * Map Caspit API document response to our DocumentResponse format
   */
  private mapApiDocumentToDocument(apiDoc: any): DocumentResponse {
    // For receipts with only payment lines (no items), Total is 0 but TotalPayment has the actual amount
    const total = apiDoc.Total || apiDoc.TotalPayment || 0;

    return {
      id: apiDoc.DocumentId,
      documentNumber: apiDoc.Number,
      date: apiDoc.Date,
      dueDate: apiDoc.DueDate,
      type: apiDoc.TrxTypeId,
      clientId: apiDoc.CustomerId,
      subtotal: apiDoc.TotalBeforeVAT,
      vatAmount: apiDoc.Vat,
      total: total,
      payment: apiDoc.Payment,
      totalPayment: apiDoc.TotalPayment,
      currency: apiDoc.ReceiptCurrencySymbol || '₪',
      url: apiDoc.ViewUrl,
      pdfUrl: apiDoc.LinkToPdf,
      items: [],
    };
  }

  /**
   * Create a new document
   */
  async create(data: CreateDocumentRequest): Promise<DocumentResponse> {
    this.validateCreateRequest(data);

    const token = await this.authManager.getToken();

    const requestData = this.prepareDocumentData(data);

    const response = await this.httpClient.post<any>(
      '/documents',
      requestData,
      {
        params: { token },
      }
    );

    return this.mapApiDocumentToDocument(response.data);
  }

  /**
   * Get a document by ID
   */
  async get(documentId: string): Promise<DocumentResponse> {
    if (!documentId) {
      throw new ValidationError('Document ID is required', 'documentId');
    }

    const token = await this.authManager.getToken();

    const response = await this.httpClient.get<DocumentResponse>(`/documents/${documentId}`, {
      params: { token },
    });

    return response.data;
  }

  /**
   * List documents with optional filters
   */
  async list(options: {
    clientId?: string;
    type?: DocumentType;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<DocumentResponse[]> {
    const token = await this.authManager.getToken();

    const params: Record<string, unknown> = {
      token,
      ...options,
    };

    const response = await this.httpClient.get<DocumentResponse[]>('/documents', {
      params,
    });

    return response.data;
  }

  /**
   * Update an existing document
   */
  async update(documentId: string, data: Partial<CreateDocumentRequest>): Promise<DocumentResponse> {
    if (!documentId) {
      throw new ValidationError('Document ID is required', 'documentId');
    }

    const token = await this.authManager.getToken();

    const requestData = this.prepareDocumentData(data);

    const response = await this.httpClient.put<DocumentResponse>(
      `/documents/${documentId}`,
      requestData,
      {
        params: { token },
      }
    );

    return response.data;
  }

  /**
   * Delete a document
   */
  async delete(documentId: string): Promise<void> {
    if (!documentId) {
      throw new ValidationError('Document ID is required', 'documentId');
    }

    const token = await this.authManager.getToken();

    await this.httpClient.delete(`/documents/${documentId}`, {
      params: { token },
    });
  }

  /**
   * Send document by email
   */
  async sendEmail(
    documentId: string,
    options: {
      to?: string;
      subject?: string;
      body?: string;
    } = {}
  ): Promise<void> {
    if (!documentId) {
      throw new ValidationError('Document ID is required', 'documentId');
    }

    const token = await this.authManager.getToken();

    await this.httpClient.post(
      `/documents/${documentId}/send`,
      options,
      {
        params: { token },
      }
    );
  }

  /**
   * Get document PDF URL
   */
  async getPdfUrl(documentId: string): Promise<string> {
    if (!documentId) {
      throw new ValidationError('Document ID is required', 'documentId');
    }

    const token = await this.authManager.getToken();

    return `${this.httpClient['axiosInstance'].defaults.baseURL}/Pdf/${documentId}?token=${token}`;
  }

  /**
   * Map currency code to currency symbol
   * Allowed values: $, £, ₪, €, A$
   */
  private getCurrencySymbol(currencyCode: string): string {
    const currencyMap: Record<string, string> = {
      'ILS': '₪',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AUD': 'A$',
    };

    // If it's already a symbol, return as-is
    if (Object.values(currencyMap).includes(currencyCode)) {
      return currencyCode;
    }

    // Map code to symbol, default to ₪
    return currencyMap[currencyCode.toUpperCase()] || '₪';
  }

  /**
   * Format date for Caspit API
   * Converts dates to YYYY-MM-DD format (date only, no time component)
   */
  private formatDate(dateString: string): string {
    // Check if it's already in date-only format (YYYY-MM-DD)
    const dateOnlyMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      // Return as-is if already in correct format
      return dateString;
    }

    // For other date formats, parse with Date and format as date-only
    const date = new Date(dateString);

    // Check if valid date
    if (isNaN(date.getTime())) {
      throw new ValidationError(`Invalid date format: ${dateString}`, 'date');
    }

    // Format as date only: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Map document type to transaction code number
   * Allowed values: 2, 3, 4, 6, 100, 101, 111, 210, 220, 343, 5010, 6020, 9020, 9030, 9040
   */
  private getTransactionCodeNumber(documentType: DocumentType): number {
    switch (documentType) {
      case DocumentType.INVOICE:
        return 100; // Invoice code
      case DocumentType.RECEIPT:
        return 2; // Receipt code
      case DocumentType.INVOICE_RECEIPT:
        return 3; // Invoice receipt code
      case DocumentType.DELIVERY_NOTE:
        return 4; // Delivery note code
      case DocumentType.QUOTE:
        return 111; // Quote code
      case DocumentType.PROFORMA:
        return 6; // Proforma code
      case DocumentType.CREDIT:
        return 101; // Credit invoice code
      case DocumentType.RETURN:
        return 220; // Return order code
      default:
        return 100; // Default to invoice
    }
  }

  /**
   * Prepare document data for API request
   */
  private prepareDocumentData(data: Partial<CreateDocumentRequest>): Record<string, unknown> {
    // Map our format to Caspit API format
    const requestData: Record<string, unknown> = {
      TrxTypeId: data.type,
      CustomerId: data.customerNumber !== undefined ? data.customerNumber : (data.customerId ? parseInt(data.customerId, 10) || data.customerId : undefined),
      TrxCodeNumber: data.type ? this.getTransactionCodeNumber(data.type) : 100,
      Language: data.language || 'he',
      IncludeVAT: data.includeVat !== undefined ? data.includeVat : true,
    };

    // Only add date fields if they exist
    if (data.date) {
      requestData.Date = this.formatDate(data.date);
    }

    if (data.dueDate) {
      requestData.DueDate = this.formatDate(data.dueDate);
    }

    // Only add optional fields if they have values
    if (data.notes) {
      requestData.Notes = data.notes;
    }

    if (data.footer) {
      requestData.Footer = data.footer;
    }

    // Map items to Caspit API format (DocumentLine)
    if (data.items && data.items.length > 0) {
      requestData.DocumentLines = data.items.map((item, index) => {
        const currencyCode = item.currency || data.currency || 'ILS';
        const mappedItem: Record<string, unknown> = {
          Number: index + 1,
          ProductName: item.description,
          UnitPrice: item.price,
          Qty: item.quantity,
          CurrencySymbol: this.getCurrencySymbol(currencyCode),
          Rebate: item.discount || 0,
          ChargeVAT: item.vatRate !== undefined && item.vatRate > 0,
        };

        // Only add notes if present (mapped to Details field)
        if (item.notes) {
          mappedItem.Details = item.notes;
        }

        return mappedItem;
      });
    }

    // Map receipt lines to Caspit API format (ReceiptLine)
    if (data.receiptLines && data.receiptLines.length > 0) {
      requestData.ReceiptLines = data.receiptLines.map((line, index) => {
        const mappedLine: Record<string, unknown> = {
          Number: line.number || index + 1,
          PaymentTypeId: line.paymentTypeId,
          Payment: line.payment,
        };

        // Only add optional fields if present
        if (line.accountNumber) {
          mappedLine.AccountNumber = line.accountNumber;
        }
        if (line.branchOrValidTo) {
          mappedLine.BranchOrValidTo = line.branchOrValidTo;
        }
        if (line.bankId) {
          mappedLine.BankId = line.bankId;
        }
        if (line.checkNumber) {
          mappedLine.CheckNumber = line.checkNumber;
        }
        if (line.paymentDate) {
          mappedLine.PaymentDate = line.paymentDate;
        }

        return mappedLine;
      });
    }

    // Email options
    if (data.sendEmail) {
      requestData.SendEmail = data.sendEmail;
      if (data.emailSubject) {
        requestData.EmailSubject = data.emailSubject;
      }
      if (data.emailBody) {
        requestData.EmailBody = data.emailBody;
      }
    }

    return requestData;
  }

  /**
   * Validate create document request
   */
  private validateCreateRequest(data: CreateDocumentRequest): void {
    if (!data.type) {
      throw new ValidationError('Document type is required', 'type');
    }

    if (!Object.values(DocumentType).includes(data.type)) {
      throw new ValidationError('Invalid document type', 'type');
    }

    if (!data.customerId || data.customerId.trim().length === 0) {
      throw new ValidationError('Client ID is required', 'customerId');
    }

    if (!data.date) {
      throw new ValidationError('Document date is required', 'date');
    }

    if (!this.isValidDate(data.date)) {
      throw new ValidationError('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)', 'date');
    }

    if (data.dueDate && !this.isValidDate(data.dueDate)) {
      throw new ValidationError('Invalid due date format. Use ISO 8601 format (YYYY-MM-DD)', 'dueDate');
    }

    // Document must have either items or receiptLines (or both)
    const hasItems = data.items && data.items.length > 0;
    const hasReceiptLines = data.receiptLines && data.receiptLines.length > 0;

    if (!hasItems && !hasReceiptLines) {
      throw new ValidationError('At least one item or receipt line is required', 'items');
    }

    // Validate items if present
    if (data.items) {
      data.items.forEach((item, index) => {
      if (!item.description || item.description.trim().length === 0) {
        throw new ValidationError(`Item ${index + 1}: Description is required`, `items[${index}].description`);
      }

      if (item.quantity <= 0) {
        throw new ValidationError(`Item ${index + 1}: Quantity must be greater than 0`, `items[${index}].quantity`);
      }

      if (item.price < 0) {
        throw new ValidationError(`Item ${index + 1}: Price cannot be negative`, `items[${index}].price`);
      }
    });
    }

    // Validate receipt lines if present
    if (data.receiptLines) {
      data.receiptLines.forEach((line, index) => {
        if (!line.paymentTypeId) {
          throw new ValidationError(`Receipt line ${index + 1}: Payment type ID is required`, `receiptLines[${index}].paymentTypeId`);
        }

        if (!line.payment || line.payment <= 0) {
          throw new ValidationError(`Receipt line ${index + 1}: Payment amount must be greater than 0`, `receiptLines[${index}].payment`);
        }
      });
    }
  }

  /**
   * Validate date format (ISO 8601)
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}
