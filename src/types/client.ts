/**
 * Caspit Client/Contact interface
 */
export interface CaspitClient {
  /**
   * Client ID (ContactId from Caspit API - used for REST operations)
   */
  id?: string;

  /**
   * Client sequential number (Number from Caspit API - used as CustomerId in document creation)
   */
  clientNumber?: number;

  /**
   * Client name
   */
  name: string;

  /**
   * Client type (1 = Business, 2 = Individual)
   */
  type?: 1 | 2;

  /**
   * Tax ID / Business number
   */
  taxId?: string;

  /**
   * Email address
   */
  email?: string;

  /**
   * Phone number
   */
  phone?: string;

  /**
   * Mobile phone number
   */
  mobile?: string;

  /**
   * Fax number
   */
  fax?: string;

  /**
   * Street address
   */
  address?: string;

  /**
   * City
   */
  city?: string;

  /**
   * Postal code
   */
  postalCode?: string;

  /**
   * Country
   */
  country?: string;

  /**
   * Additional notes
   */
  notes?: string;

  /**
   * Contact person name
   */
  contactPerson?: string;

  /**
   * Is active
   */
  active?: boolean;
}

/**
 * Request payload for creating a client
 */
export interface CreateClientRequest {
  name: string;
  type?: 1 | 2;
  taxId?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  contactPerson?: string;
}

/**
 * Search/List clients request options
 */
export interface ListClientsOptions {
  /**
   * Search query string
   */
  search?: string;

  /**
   * Page number (1-based)
   */
  page?: number;

  /**
   * Number of results per page
   */
  limit?: number;

  /**
   * Filter by active status
   */
  active?: boolean;
}

/**
 * Paginated response for list operations
 */
export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Caspit API response format for a contact/client
 */
export interface CaspitApiClient {
  ContactId: string;
  ContactType: number;
  Number: number;
  BusinessName: string | null;
  OsekMorshe: string | null;
  Name: string;
  Address1: string | null;
  Address2: string | null;
  City: string | null;
  PostalCode: string | null;
  Country: string | null;
  Phone: string | null;
  Mobile: string | null;
  Fax: string | null;
  Email: string | null;
  TrxCodeNumber: string | null;
  TrxCode: string | null;
  OpenBalance: number;
  Balance: number;
  BalanceInvoiceIska: number;
  PriceListNum: number;
  Comments1: string | null;
  Comments2: string | null;
  Comments3: string | null;
  InvoiceComment: string | null;
  BankAcctNumber: string | null;
  BankAcctBranch: string | null;
  BankAcctBankId: string | null;
  ChargeVAT: boolean;
  IsIsraeli: boolean;
  IsOccasional: boolean;
  AffiliateId: string | null;
  CCNumberToken: string | null;
  CCNumber: string | null;
  CCExpDate: string | null;
  CVV: string | null;
  PaymentTerms: number;
  PaymentTermsDays: number;
  PreferredPaymentTypeId: number;
  IsPrivateContact: boolean;
  DateCreated: string;
  UserCreated: string;
  DateUpdated: string;
  UserUpdated: string;
}
