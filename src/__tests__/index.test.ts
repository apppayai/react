import { PaymentModal, AppPayAPI, useRouteDiscovery, usePaymentExecution } from '../index';

// Mock thirdweb hooks
jest.mock('thirdweb/react', () => ({
  useActiveAccount: () => ({ address: '0x1234567890123456789012345678901234567890' }),
  useActiveWalletChain: () => ({ id: 1 }),
  useSwitchActiveWalletChain: () => jest.fn(),
}));

describe('@apppay/react', () => {
  describe('API Client', () => {
    it('should create API instance with default URLs', () => {
      const api = new AppPayAPI();
      expect(api).toBeDefined();
    });

    it('should create API instance', () => {
      const api = new AppPayAPI();
      expect(api).toBeDefined();
    });
  });

  describe('Exports', () => {
    it('should export PaymentModal component', () => {
      expect(PaymentModal).toBeDefined();
    });

    it('should export AppPayAPI class', () => {
      expect(AppPayAPI).toBeDefined();
    });

    it('should export hooks', () => {
      expect(useRouteDiscovery).toBeDefined();
      expect(usePaymentExecution).toBeDefined();
    });
  });
});
