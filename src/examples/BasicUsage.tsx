import React, { useState } from 'react';
import { PaymentModal } from '../index';

/**
 * Basic usage example
 */
export function BasicUsage() {
  const [isOpen, setIsOpen] = useState(false);
  const paymentId = 'pay_1234567890'; // This would come from your backend

  return (
    <div className="p-8">
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Pay Now
      </button>

      <PaymentModal
        paymentId={paymentId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPaymentComplete={(result) => {
          console.log('Payment completed:', result);
          setIsOpen(false);
          // Handle success (redirect, show success message, etc.)
        }}
        theme="light"
      />
    </div>
  );
}

/**
 * Advanced usage with custom styling
 */
export function AdvancedUsage() {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentId, setPaymentId] = useState<string>('');

  const handleCreatePayment = async () => {
    // This would typically be done on your backend
    // For demo purposes, we'll simulate it
    const mockPaymentId = 'pay_' + Date.now();
    setPaymentId(mockPaymentId);
    setIsOpen(true);
  };

  return (
    <div className="p-8">
      <button
        onClick={handleCreatePayment}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Create & Pay Invoice
      </button>

      <PaymentModal
        paymentId={paymentId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPaymentComplete={(result) => {
          console.log('Payment completed:', result);
          setIsOpen(false);
          alert(`Payment successful! TX: ${result.transactionHash}`);
        }}
        theme="dark"
        style={{
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      />
    </div>
  );
}
