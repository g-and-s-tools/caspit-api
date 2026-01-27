import { ValidationError } from '../../src/types/error';
import { DocumentType } from '../../src/types/document';

describe('Validation', () => {
  describe('ValidationError', () => {
    it('should create validation error with message and field', () => {
      const error = new ValidationError('Invalid email', 'email');
      expect(error.message).toBe('Invalid email');
      expect(error.field).toBe('email');
      expect(error.name).toBe('ValidationError');
    });

    it('should create validation error without field', () => {
      const error = new ValidationError('Invalid data');
      expect(error.message).toBe('Invalid data');
      expect(error.field).toBeUndefined();
    });
  });

  describe('Document Types', () => {
    it('should have correct document type values', () => {
      expect(DocumentType.INVOICE).toBe(1);
      expect(DocumentType.RECEIPT).toBe(2);
      expect(DocumentType.INVOICE_RECEIPT).toBe(3);
      expect(DocumentType.DELIVERY_NOTE).toBe(4);
      expect(DocumentType.QUOTE).toBe(5);
      expect(DocumentType.PROFORMA).toBe(6);
      expect(DocumentType.CREDIT).toBe(7);
      expect(DocumentType.RETURN).toBe(8);
    });
  });
});
