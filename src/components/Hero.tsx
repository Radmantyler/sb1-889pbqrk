import React, { useState } from 'react';
import { PaymentModal } from './PaymentModal';

export function Hero() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="py-20 text-center">
      <h1 className="text-5xl font-bold mb-4">
        <span className="text-gray-900">AI-Powered Radiological </span>
        <span className="text-green-500">Assessment Reports</span>
      </h1>
      <p className="text-gray-600 text-xl max-w-3xl mx-auto mb-8">
        Streamline radiological compliance reporting with advanced AI technology.
        Generate accurate, compliant reports for state and federal agencies.
      </p>
      <button 
        onClick={() => setShowPaymentModal(true)}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg"
      >
        Start Assessment →
      </button>

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
}