import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThirdwebProvider, useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain, ConnectButton } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import type { PaymentModalProps, PaymentData, Route } from '../types';
import { AppPayAPI } from '../services/AppPayAPI';
import { useRouteDiscovery } from '../hooks/useRouteDiscovery';
import { usePaymentExecution } from '../hooks/usePaymentExecution';

const PaymentModalContent: React.FC<PaymentModalProps> = ({
  paymentId,
  isOpen,
  onClose,
  onPaymentComplete,
  theme = 'light',
  style,
}) => {
  // Only render when modal is open to ensure ThirdwebProvider context is available
  if (!isOpen) return null;

  // Now we can safely use Thirdweb hooks since the component is only rendered when isOpen is true
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

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            style={{
              position: 'relative',
              background: theme === 'dark' ? '#1e293b' : 'white',
              color: theme === 'dark' ? 'white' : 'black',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              ...style
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Complete Payment</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    color: '#6b7280',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    lineHeight: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem'
            }}>
              {loading && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{
                    animation: 'spin 1s linear infinite',
                    borderRadius: '50%',
                    height: '2rem',
                    width: '2rem',
                    border: '2px solid transparent',
                    borderTopColor: '#3b82f6',
                    margin: '0 auto'
                  }}></div>
                  <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>Loading payment...</p>
                </div>
              )}

              {error && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                  <p style={{ marginTop: '0.5rem', color: '#dc2626' }}>{error}</p>
                  <button
                    onClick={loadPaymentData}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      marginTop: '1rem',
                      maxWidth: '200px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {paymentData && !error && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Payment Info */}
                  <div style={{
                    background: theme === 'dark' ? '#374151' : '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      {paymentData.merchantAvatar && (
                        <img
                          src={paymentData.merchantAvatar}
                          alt={paymentData.merchantName}
                          style={{ width: '2rem', height: '2rem', borderRadius: '50%' }}
                        />
                      )}
                      <div>
                        <h3 style={{ fontWeight: '500', margin: 0 }}>{paymentData.merchantName}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{paymentData.title}</p>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {paymentData.amount} {paymentData.currency}
                    </div>
                    {paymentData.description && (
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem', margin: 0 }}>{paymentData.description}</p>
                    )}
                  </div>

                  {/* Wallet Connection */}
                  {!account && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <p style={{ color: '#6b7280', marginBottom: '0.5rem', margin: 0 }}>Connect your wallet to continue</p>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          MetaMask, WalletConnect, or any Web3 wallet
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ConnectButton
                          client={client}
                          theme={theme === 'dark' ? 'dark' : 'light'}
                          connectButton={{
                            label: 'Connect Wallet',
                            style: {
                              backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '12px 24px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              width: '100%',
                              maxWidth: '200px'
                            }
                          }}
                        />
                      </div>
                      <div style={{
                        background: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        marginTop: '1rem'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.5rem',
                          fontSize: '0.75rem',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: '#6b7280'
                          }}>
                            <div style={{
                              width: '0.25rem',
                              height: '0.25rem',
                              borderRadius: '50%',
                              backgroundColor: '#10b981'
                            }} />
                            <span>Secure connection</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: '#6b7280'
                          }}>
                            <div style={{
                              width: '0.25rem',
                              height: '0.25rem',
                              borderRadius: '50%',
                              backgroundColor: '#3b82f6'
                            }} />
                            <span>500+ wallets</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: '#6b7280'
                          }}>
                            <div style={{
                              width: '0.25rem',
                              height: '0.25rem',
                              borderRadius: '50%',
                              backgroundColor: '#8b5cf6'
                            }} />
                            <span>Social & email</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: '#6b7280'
                          }}>
                            <div style={{
                              width: '0.25rem',
                              height: '0.25rem',
                              borderRadius: '50%',
                              backgroundColor: '#f59e0b'
                            }} />
                            <span>Buy crypto</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {account && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Route Discovery */}
                      <div>
                        <button
                          onClick={handleDiscoverRoutes}
                          disabled={isDiscoveringRoutes}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            fontWeight: '500',
                            cursor: isDiscoveringRoutes ? 'not-allowed' : 'pointer',
                            border: 'none',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            opacity: isDiscoveringRoutes ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isDiscoveringRoutes) {
                              e.currentTarget.style.backgroundColor = '#2563eb';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isDiscoveringRoutes) {
                              e.currentTarget.style.backgroundColor = '#3b82f6';
                            }
                          }}
                        >
                          {isDiscoveringRoutes ? 'Finding Routes...' : 'Find Payment Routes'}
                        </button>
                        {routeDiscoveryError && (
                          <p style={{
                            color: '#ef4444',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            marginTop: '0.5rem'
                          }}>{routeDiscoveryError}</p>
                        )}
                      </div>

                      {/* Routes */}
                      {routes.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <h4 style={{ fontWeight: '500', margin: 0 }}>Available Routes</h4>
                          {routes.map((route) => (
                            <div
                              key={route.id}
                              onClick={() => setSelectedRoute(route)}
                              style={{
                                padding: '0.75rem',
                                border: `1px solid ${selectedRoute?.id === route.id ? '#3b82f6' : theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginBottom: '0.5rem',
                                backgroundColor: selectedRoute?.id === route.id ? '#eff6ff' : theme === 'dark' ? '#1f2937' : 'white',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (selectedRoute?.id !== route.id) {
                                  e.currentTarget.style.borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedRoute?.id !== route.id) {
                                  e.currentTarget.style.borderColor = theme === 'dark' ? '#374151' : '#e5e7eb';
                                }
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div>
                                  <div style={{ fontWeight: '500' }}>{route.provider}</div>
                                  <div style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    marginTop: '0.25rem'
                                  }}>
                                    {route.estimatedTime} min • Fee: ${route.estimatedFee.totalFee.toFixed(2)}
                                  </div>
                                </div>
                                {route.isOptimal && (
                                  <span style={{
                                    fontSize: '0.75rem',
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px'
                                  }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              fontWeight: '500',
                              cursor: isProcessing ? 'not-allowed' : 'pointer',
                              border: 'none',
                              backgroundColor: '#10b981',
                              color: 'white',
                              opacity: isProcessing ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!isProcessing) {
                                e.currentTarget.style.backgroundColor = '#059669';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isProcessing) {
                                e.currentTarget.style.backgroundColor = '#10b981';
                              }
                            }}
                          >
                            {isProcessing ? 'Processing Payment...' : `Pay ${paymentData.amount} ${paymentData.currency}`}
                          </button>

                          {/* Payment Steps */}
                          {isProcessing && (
                            <div style={{ marginTop: '0.5rem' }}>
                              {paymentSteps.map((step, index) => (
                                <div key={step.id} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.875rem',
                                  marginBottom: '0.25rem'
                                }}>
                                  <div style={{
                                    width: '0.5rem',
                                    height: '0.5rem',
                                    borderRadius: '50%',
                                    backgroundColor: step.status === 'completed' ? '#10b981' :
                                                   step.status === 'processing' ? '#3b82f6' :
                                                   step.status === 'failed' ? '#ef4444' : '#d1d5db',
                                    animation: step.status === 'processing' ? 'pulse 2s infinite' : 'none'
                                  }} />
                                  <span style={{
                                    color: step.status === 'completed' ? '#059669' :
                                           step.status === 'processing' ? '#2563eb' :
                                           step.status === 'failed' ? '#dc2626' : '#6b7280'
                                  }}>
                                    {step.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {errorMessage && (
                            <div style={{
                              color: '#ef4444',
                              fontSize: '0.875rem',
                              textAlign: 'center',
                              marginTop: '0.5rem'
                            }}>
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
        )}
      </AnimatePresence>
    </>
  );
};

// Create a Thirdweb client for the npm package
const client = createThirdwebClient({
  clientId: "apppay-react-package",
});

const PaymentModal: React.FC<PaymentModalProps> = (props) => {
  return (
    <ThirdwebProvider>
      <PaymentModalContent {...props} />
    </ThirdwebProvider>
  );
};

export default PaymentModal;
