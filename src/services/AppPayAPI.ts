import type { PaymentData, Route } from '../types';

export class AppPayAPI {
  private apiBaseUrl: string;
  private wsBaseUrl: string;

  constructor() {
    // Detect environment and use appropriate URLs
    const isDevelopment = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost') ||
      window.location.hostname === '0.0.0.0'
    );

    if (isDevelopment) {
      // Use localhost for development testing
      this.apiBaseUrl = 'http://localhost:3082';
      this.wsBaseUrl = 'ws://localhost:3084';
    } else {
      // Use production domains
      this.apiBaseUrl = 'https://api.apppay.ai';
      this.wsBaseUrl = 'wss://ws.apppay.ai';
    }
  }

  /**
   * Load payment data from payment ID
   */
  async loadPayment(paymentId: string): Promise<PaymentData> {
    const response = await fetch(`${this.apiBaseUrl}/api/sales/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load payment: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid payment data received');
    }

    const item = data.data;

    return {
      paymentId,
      title: item.title || 'Payment',
      description: item.description || '',
      amount: String(item.amount || '0'),
      currency: item.userCurrency || 'USD',
      userCurrency: item.userCurrency || 'USD',
      sellerAddress: item.sellerAddress || '',
      sellerPreferredToken: item.token || {
        symbol: 'USDC',
        chainId: 1,
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      },
      userWalletChain: item.token?.chainId || 1,
      feeStrategy: item.feeStrategy || 'buyer',
      merchantName: item.sellerDisplayName || 'Merchant',
      merchantAvatar: item.sellerAvatarUrl,
      imageUri: item.imageUri,
    };
  }

  /**
   * Discover payment routes
   */
  async discoverRoutes(params: {
    fromChainId: number;
    toChainId: number;
    fromToken: string;
    toToken: string;
    amount: string;
    userAddress?: string;
  }): Promise<{ routes: Route[]; recommendedRoute?: Route }> {
    const response = await fetch(`${this.apiBaseUrl}/api/mcp/discover-routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to discover routes: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Route discovery failed');
    }

    return {
      routes: data.data.routes || [],
      recommendedRoute: data.data.recommendedRoute,
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<{
    status: string;
    transactionHash?: string;
    metadata?: any;
  }> {
    const response = await fetch(`${this.apiBaseUrl}/api/mcp/v1/${paymentId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get payment status: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Failed to get payment status');
    }

    return {
      status: data.data.status,
      transactionHash: data.data.originTxHash,
      metadata: data.data.metadata,
    };
  }

  /**
   * Get WebSocket URL for real-time updates
   */
  getWebSocketUrl(): string {
    return this.wsBaseUrl;
  }
}
