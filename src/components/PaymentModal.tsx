import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain } from 'thirdweb/react';
import type { PaymentModalProps, PaymentData, Route } from '../types';
import { AppPayAPI } from '../services/AppPayAPI';
import { useRouteDiscovery } from '../hooks/useRouteDiscovery';
import { usePaymentExecution } from '../hooks/usePaymentExecution';

const PaymentModal: React.FC<PaymentModalProps> = ({
  paymentId,
  isOpen,
  onClose,
  onPaymentComplete,
  theme = 'light',
  style,
}) => {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new AppPayAPI();
  const {
    routes,
    selectedRoute,
    isDiscoveringRoutes,
    routeDiscoveryError,
    discoverRoutes,
    setSelectedRoute,
  } = useRouteDiscovery(api);

  const {
    isProcessing,
    paymentSteps,
    errorMessage,
    executePayment,
  } = usePaymentExecution(paymentData || {} as PaymentData, onPaymentComplete, onClose);

  // Load payment data when modal opens
  useEffect(() => {
    if (isOpen && paymentId && !paymentData) {
      loadPaymentData();
    }
  }, [isOpen, paymentId, paymentData]);

  const loadPaymentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.loadPayment(paymentId);
      setPaymentData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverRoutes = async () => {
    if (!paymentData) return;
    await discoverRoutes(paymentData);
  };

  const handlePayment = async () => {
    if (!selectedRoute) return;
    await executePayment(selectedRoute);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
            theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-black'
          }`}
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Complete Payment</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading payment...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg">⚠️</div>
                <p className="mt-2 text-red-600">{error}</p>
                <button
                  onClick={loadPaymentData}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            )}

            {paymentData && !error && (
              <div className="space-y-4">
                {/* Payment Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    {paymentData.merchantAvatar && (
                      <img
                        src={paymentData.merchantAvatar}
                        alt={paymentData.merchantName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{paymentData.merchantName}</h3>
                      <p className="text-sm text-gray-600">{paymentData.title}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {paymentData.amount} {paymentData.currency}
                  </div>
                  {paymentData.description && (
                    <p className="text-sm text-gray-600 mt-1">{paymentData.description}</p>
                  )}
                </div>

                {/* Wallet Connection */}
                {!account && (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">Connect your wallet to continue</p>
                    <div className="text-sm text-gray-500">
                      MetaMask, WalletConnect, or any Web3 wallet
                    </div>
                  </div>
                )}

                {account && (
                  <div className="space-y-4">
                    {/* Route Discovery */}
                    <div>
                      <button
                        onClick={handleDiscoverRoutes}
                        disabled={isDiscoveringRoutes}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        {isDiscoveringRoutes ? 'Finding Routes...' : 'Find Payment Routes'}
                      </button>
                      {routeDiscoveryError && (
                        <p className="text-red-500 text-sm mt-1">{routeDiscoveryError}</p>
                      )}
                    </div>

                    {/* Routes */}
                    {routes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Available Routes</h4>
                        {routes.map((route) => (
                          <div
                            key={route.id}
                            onClick={() => setSelectedRoute(route)}
                            className={`p-3 border rounded cursor-pointer ${
                              selectedRoute?.id === route.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{route.provider}</div>
                                <div className="text-sm text-gray-600">
                                  {route.estimatedTime} min • Fee: ${route.estimatedFee.totalFee.toFixed(2)}
                                </div>
                              </div>
                              {route.isOptimal && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Best
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment Execution */}
                    {selectedRoute && (
                      <div className="space-y-2">
                        <button
                          onClick={handlePayment}
                          disabled={isProcessing}
                          className="w-full px-4 py-3 bg-green-500 text-white rounded font-medium hover:bg-green-600 disabled:opacity-50"
                        >
                          {isProcessing ? 'Processing Payment...' : `Pay ${paymentData.amount} ${paymentData.currency}`}
                        </button>

                        {/* Payment Steps */}
                        {isProcessing && (
                          <div className="space-y-1">
                            {paymentSteps.map((step, index) => (
                              <div key={step.id} className="flex items-center space-x-2 text-sm">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    step.status === 'completed' ? 'bg-green-500' :
                                    step.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                                    step.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                                  }`}
                                />
                                <span className={
                                  step.status === 'completed' ? 'text-green-600' :
                                  step.status === 'processing' ? 'text-blue-600' :
                                  step.status === 'failed' ? 'text-red-600' : 'text-gray-500'
                                }>
                                  {step.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {errorMessage && (
                          <div className="text-red-500 text-sm text-center">
                            {errorMessage}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
