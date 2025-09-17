export interface PaymentModalProps {
  /**
   * Payment ID - the only required prop. Everything else is loaded from the server.
   */
  paymentId: string;

  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when user closes the modal
   */
  onClose?: () => void;

  /**
   * Callback when payment is completed successfully
   */
  onPaymentComplete?: (result: PaymentResult) => void;

  /**
   * Theme - defaults to 'light'
   */
  theme?: 'light' | 'dark';

  /**
   * Custom styling
   */
  style?: React.CSSProperties;
}

export interface PaymentResult {
  paymentId: string;
  transactionHash: string;
  amount: string;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PaymentData {
  paymentId: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  userCurrency: string;
  sellerAddress: string;
  sellerPreferredToken: {
    symbol: string;
    address?: string;
    chainId: number;
    decimals?: number;
  };
  userWalletChain: number;
  feeStrategy: 'buyer' | 'seller';
  merchantName?: string;
  merchantAvatar?: string;
  imageUri?: string;
}

export interface Route {
  id: string;
  provider: string;
  bridge: string;
  service: string;
  fromChainId: number;
  toChainId: number;
  fromAmount: string;
  toAmount: string;
  fromToken: string;
  fromTokenAddress: string;
  toToken: string;
  toTokenAddress: string;
  estimatedTime: number;
  estimatedFee: {
    baseFee: number;
    percentageFee: number;
    totalFee: number;
    breakdown: {
      bridgeFee: number;
      gasFee: number;
      ourCommission: number;
    };
  };
  buyerFees: {
    serviceFee: number;
    gasFees: { amount: number; paidBy: 'buyer' | 'seller' };
    bridgeFees: number;
    totalCost: number;
    sellerReceives: number;
  };
  isOptimal: boolean;
  isReal: boolean;
  dataSource: string;
}

export interface PaymentStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export type ErrorType = 'insufficient_funds' | 'no_wallet' | 'user_cancelled' | 'generic' | null;
