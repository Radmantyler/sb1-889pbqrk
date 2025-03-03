import React, { useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Base URL for the application
  const baseUrl = window.location.origin;
  
  // UTM parameters for tracking
  const utmParams = new URLSearchParams({
    utm_source: 'webapp',
    utm_medium: 'direct',
    utm_campaign: 'assessment'
  }).toString();

  // Construct the success URL with session ID parameter
  const successUrl = `${baseUrl}/upload?session_id={CHECKOUT_SESSION_ID}&${utmParams}`;

  // Single report payment URL with redirect
  const singleReportUrl = `https://buy.stripe.com/test_aEU5mY3ke7Lt8ec6oo?redirect_status=succeeded&redirect_url=${encodeURIComponent(successUrl)}`;

  // Subscription payment URL with redirect
  const subscriptionUrl = `https://buy.stripe.com/test_bIY02Eg704zh1POaEF?redirect_status=succeeded&redirect_url=${encodeURIComponent(successUrl)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* One-Time Report */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Single Report</h3>
                  <p className="text-gray-600 mt-1">Perfect for one-time assessments</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  One-time
                </span>
              </div>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  One Complete Assessment
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  AI-Powered Analysis
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Regulatory Compliance Check
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Export & Share Report
                </li>
              </ul>
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">$10</p>
                <p className="text-gray-500">One-time payment</p>
              </div>
              <div className="space-y-3">
                <a
                  href={singleReportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Buy Single Report
                </a>
                <Link
                  to="/upload"
                  onClick={onClose}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-blue-600 font-medium border border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Go to Upload Page
                </Link>
              </div>
            </div>

            {/* Subscription Plan */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Professional Plan</h3>
                  <p className="text-gray-600 mt-1">Best value for regular assessments</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Popular
                </span>
              </div>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Unlimited Assessments
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  AI-Powered Analysis
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Priority Processing
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Advanced Analytics
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Export & Share Reports
                </li>
              </ul>
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">$99</p>
                <p className="text-gray-500">per month</p>
              </div>
              <a
                href={subscriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition-colors"
              >
                Subscribe Now
              </a>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Secure payment powered by Stripe. Subscription can be canceled anytime.
          </p>
        </div>
      </div>
    </div>
  );
}