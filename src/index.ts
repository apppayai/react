// Main component
export { default as PaymentModal } from './components/PaymentModal';

// Thirdweb hooks (re-export for convenience)
export { useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain } from 'thirdweb/react';

// Types
export type {
  PaymentModalProps,
  PaymentResult,
  PaymentData,
  Route,
  PaymentStep,
  ErrorType,
} from './types';

// Services (for advanced usage)
export { AppPayAPI } from './services/AppPayAPI';
export { WebSocketManager } from './services/WebSocketManager';

// Hooks (for advanced usage)
export { useRouteDiscovery } from './hooks/useRouteDiscovery';
export { usePaymentExecution } from './hooks/usePaymentExecution';
