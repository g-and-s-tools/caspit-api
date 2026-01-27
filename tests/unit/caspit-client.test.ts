import { CaspitClient } from '../../src/caspit-client';
import { ValidationError } from '../../src/types/error';

describe('CaspitClient', () => {
  let client: CaspitClient;

  beforeEach(() => {
    client = new CaspitClient({
      username: 'test-user',
      password: 'test-password',
      organizationId: 'test-org',
    });
  });

  describe('Configuration', () => {
    it('should initialize with default configuration', () => {
      const config = client.getConfig();
      expect(config.baseUrl).toBe('https://app.caspit.biz/api/v1');
      expect(config.timeout).toBe(30000);
      expect(config.maxRetries).toBe(3);
      expect(config.debug).toBe(false);
      expect(config.format).toBe('json');
    });

    it('should accept custom configuration', () => {
      const customClient = new CaspitClient({
        username: 'test-user',
        password: 'test-password',
        organizationId: 'test-org',
        baseUrl: 'https://custom.api.url',
        timeout: 60000,
        maxRetries: 5,
        debug: true,
        format: 'xml',
      });

      const config = customClient.getConfig();
      expect(config.baseUrl).toBe('https://custom.api.url');
      expect(config.timeout).toBe(60000);
      expect(config.maxRetries).toBe(5);
      expect(config.debug).toBe(true);
      expect(config.format).toBe('xml');
    });
  });

  describe('Managers', () => {
    it('should have clients manager', () => {
      expect(client.clients).toBeDefined();
    });

    it('should have documents manager', () => {
      expect(client.documents).toBeDefined();
    });
  });

  describe('Token Management', () => {
    it('should clear token', () => {
      expect(() => client.clearToken()).not.toThrow();
    });
  });
});
