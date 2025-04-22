import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { FiCreditCard, FiUser, FiCalendar, FiDollarSign } from 'react-icons/fi';

const PaymentVerification = ({ orderId }) => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/api/verify-payment', {
        params: { session_id: orderId } // Assuming orderId is the Stripe session ID
      });

      setPaymentDetails(response.data);
      setVerificationStatus(response.data.payment_status === 'paid' ? 'success' : 'failed');
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Verification failed");
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      verifyPayment();
    }
  }, [orderId]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <FiCreditCard className="mr-2" />
        Payment Verification
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <p className="text-lg">Verifying payment details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : verificationStatus === 'success' ? (
        <div className="space-y-6">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <div className="flex items-center">
              <FaCheckCircle className="text-2xl mr-2" />
              <span className="font-bold">Payment Verified Successfully</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiUser className="mr-2" />
                Customer Details
              </h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Email:</span> {paymentDetails?.customer_email}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiDollarSign className="mr-2" />
                Payment Details
              </h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Amount:</span> Rs. {(paymentDetails?.amount_total / 100).toLocaleString()}</p>
                <p><span className="text-gray-600">Status:</span> 
                  <span className={`ml-1 font-medium ${
                    paymentDetails?.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {paymentDetails?.payment_status}
                  </span>
                </p>
                <p><span className="text-gray-600">Payment ID:</span> {orderId}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button 
              onClick={verifyPayment}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Re-verify Payment
            </button>
          </div>
        </div>
      ) : verificationStatus === 'failed' ? (
        <div className="space-y-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <div className="flex items-center">
              <FaTimesCircle className="text-2xl mr-2" />
              <span className="font-bold">Payment Verification Failed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Order Information</h3>
              <p>Order ID: {orderId}</p>
            </div>
          </div>

          <div className="mt-4 space-x-4">
            <button 
              onClick={verifyPayment}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No payment verification data available</p>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;