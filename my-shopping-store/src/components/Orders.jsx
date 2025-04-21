import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiPackage, FiTruck, FiCreditCard, FiUser,
  FiCalendar, FiDollarSign, FiEdit, FiChevronDown, FiFile
} from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingPaymentStatus, setEditingPaymentStatus] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [ordersResponse, paymentsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/orders', {
            params: {
              page,
              limit: 10,
              status: statusFilter,
              paymentStatus: paymentStatusFilter
            }
          }),
          axios.get('http://localhost:5000/api/payments')
        ]);

        if (!ordersResponse.data || !paymentsResponse.data) {
          throw new Error("Invalid response from server");
        }

        const ordersData = Array.isArray(ordersResponse.data.orders)
          ? ordersResponse.data.orders
          : Array.isArray(ordersResponse.data)
            ? ordersResponse.data
            : [];

        const paymentsData = Array.isArray(paymentsResponse.data.payments)
          ? paymentsResponse.data.payments
          : Array.isArray(paymentsResponse.data)
            ? paymentsResponse.data
            : [];

        const ordersWithPayments = ordersData.map(order => {
          const payment = paymentsData.find(p => p.orderId === order._id);
          return {
            ...order,
            payment: payment || null
          };
        });

        setOrders(ordersWithPayments);
        setTotalPages(ordersResponse.data.pages || 1);
        setTotalOrders(ordersResponse.data.total || ordersData.length);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, statusFilter, paymentStatusFilter]);

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
    setEditingStatus(null);
    setEditingPaymentStatus(null);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        status: newStatus
      });

      if (response.data.success) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success('Order status updated successfully');
        setEditingStatus(null);
      } else {
        throw new Error(response.data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to update order status');
    }
  };

  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        paymentStatus: newPaymentStatus
      });

      if (response.data.success) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        ));
        toast.success('Payment status updated successfully');
        setEditingPaymentStatus(null);
      } else {
        throw new Error(response.data.error || 'Failed to update payment status');
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to update payment status');
    }
  };

  const handleShippingMethodUpdate = async (orderId, newShippingMethod) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        shippingMethod: newShippingMethod
      });

      if (response.data.success) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, shippingMethod: newShippingMethod } : order
        ));
        toast.success('Shipping method updated successfully');
      } else {
        throw new Error(response.data.error || 'Failed to update shipping method');
      }
    } catch (err) {
      console.error('Error updating shipping method:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to update shipping method');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'Shipped':
        return <FiTruck className="text-blue-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const getPaymentStatusIcon = (status) => {
    return status === 'Paid'
      ? <FaCheckCircle className="text-green-500" />
      : <FaTimesCircle className="text-red-500" />;
  };

  const renderPaymentDetails = (order) => {
    const payment = order.payment;

    if (payment === null) {
      return (
        <div className="text-center py-4 text-gray-500">
          <p>No payment details available for this order</p>
        </div>
      );
    }

    const renderDetails = () => {
      switch (payment.method) {
        case 'Credit Card':
        case 'Debit Card':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600">Card Holder</p>
                <p className="text-gray-800">{payment.details?.cardHolderName || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Card Number</p>
                <p className="text-gray-800">
                  {payment.details?.cardNumber ? `•••• •••• •••• ${payment.details.cardNumber.slice(-4)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Expiry Date</p>
                <p className="text-gray-800">{payment.details?.expiryDate || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">CVV</p>
                <p className="text-gray-800">{payment.details?.cvv ? '•••' : 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium text-gray-600">Billing Address</p>
                <p className="text-gray-800">{payment.details?.billingAddress || 'N/A'}</p>
              </div>
            </div>
          );
        case 'Easypaisa':
        case 'Jazz Cash':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600">Mobile Number</p>
                <p className="text-gray-800">{payment.details?.mobileNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Transaction ID</p>
                <p className="text-gray-800">{payment.details?.transactionId || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">CNIC</p>
                <p className="text-gray-800">{payment.details?.cnic || 'N/A'}</p>
              </div>
            </div>
          );
        case 'Bank Account Transfer':
        case 'Bank Transfer':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600">Account Title</p>
                <p className="text-gray-800">{payment.details?.accountTitle || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Bank Name</p>
                <p className="text-gray-800">{payment.details?.bankName || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Account Number</p>
                <p className="text-gray-800">{payment.details?.senderAccountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Transfer Date</p>
                <p className="text-gray-800">{payment.details?.transferDate || 'N/A'}</p>
              </div>
            </div>
          );
        case 'Cash on Delivery':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600">Recipient Name</p>
                <p className="text-gray-800">{payment.details?.recipientName || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Delivery Address</p>
                <p className="text-gray-800">{payment.details?.deliveryAddress || 'N/A'}</p>
              </div>
            </div>
          );
        default:
          return <p className="text-gray-500">Payment details not available</p>;
      }
    };

    return (
      <div className="mt-4">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
          <FiCreditCard className="mr-2" />
          Payment Details ({payment.method})
        </h4>
        {renderDetails()}

        {payment.details?.paymentProof && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FiFile className="mr-2" />
              Payment Proof
            </h4>
            <div className="border rounded-2xl p-4 bg-gray-50">
              {payment.details.paymentProof.endsWith('.pdf') ? (
                <div>
                  <a
                    href={`http://localhost:5000/${payment.details.paymentProof}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:underline flex items-center mb-2"
                  >
                    <FiFile className="mr-2" />
                    View PDF Receipt
                  </a>
                  <iframe
                    src={`http://localhost:5000/${payment.details.paymentProof}`}
                    className="w-full h-64 border rounded"
                    title="Payment proof PDF"
                  />
                </div>
              ) : (
                <div>
                  {isImageModalOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/20 backdrop-blur-sm"
                      onClick={() => setIsImageModalOpen(false)}
                    >
                      <div className="relative w-full max-w-4xl max-h-[90vh]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsImageModalOpen(false);
                          }}
                          className="absolute -top-20 -right-64 rounded-full text-black bg-white/45 hover:bg-white/60 transition-colors p-2"
                          aria-label="Close modal"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>

                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className="overflow-hidden rounded-xl shadow-2xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            src={`http://localhost:5000/${payment.details.paymentProof}`}
                            alt="Payment proof"
                            className="w-full h-auto max-h-[80vh] object-contain"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  <div
                    className="relative group cursor-pointer w-fit mx-auto"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 group-hover:border-cyan-400 transition-all duration-300">
                      <img
                        src={`http://localhost:5000/${payment.details.paymentProof}`}
                        alt="Payment proof thumbnail"
                        className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/90 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-cyan-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Click to view full screen
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center w-screen h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="rounded-full h-20 w-20 border-t-2 border-b-2 border-cyan-700"
      ></motion.div>
    </div>
  );

  if (error) return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-6"
      role="alert"
    >
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
          <FiPackage className="mr-3 text-cyan-600" />
          Order Management
        </h1>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Showing {((page - 1) * 10) + 1}-{Math.min(page * 10, totalOrders)} of {totalOrders} orders
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded p-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700">Payment:</label>
          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded p-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          >
            <option value="">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow p-8 text-center"
        >
          <FiPackage className="mx-auto text-4xl text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No Orders Found</h2>
          <p className="text-gray-500 mt-2">Your order list is currently empty</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const orderNumber = ((page - 1) * 10) + index + 1;
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${expandedOrder === order._id ? 'ring-2 ring-cyan-500' : 'hover:shadow-lg'
                  }`}
              >
                <motion.div
                  className="p-5 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleOrderExpand(order._id)}
                  whileHover={{ backgroundColor: 'rgba(236, 253, 245, 0.5)' }}
                >
                  <div className="flex items-center space-x-2">
                    <h1 className="bg-black/15 inline-flex items-center justify-center w-7 h-7 font-bold aspect-square rounded-full text-gray-700">
                      {orderNumber}
                    </h1>
                    <div className="p-3 rounded-full bg-cyan-100 text-cyan-600">
                      <FiPackage className="text-xl" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800">Order #{order._id.slice(-8).toUpperCase()}</h2>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`text-xs sm:text-sm font-medium ${order.status === 'Delivered' ? 'text-green-600' :
                        order.status === 'Shipped' ? 'text-blue-600' : 'text-yellow-600'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-2">
                      {getPaymentStatusIcon(order.paymentStatus)}
                      <span className={`text-xs sm:text-sm font-medium ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-800">
                      Rs.{order.grandTotal.toLocaleString()}
                    </div>
                    <motion.div
                      animate={{ rotate: expandedOrder === order._id ? 180 : 0 }}
                      className="text-gray-500"
                    >
                      <FiChevronDown />
                    </motion.div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {expandedOrder === order._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: 'auto',
                        transition: { duration: 0.3, ease: "easeInOut" }
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-200 px-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-100 rounded-2xl shadow-md p-4"
                          >
                            <div className="flex items-center mb-3">
                              <FiUser className="text-gray-500 mr-2" />
                              <h3 className="font-semibold text-gray-700">Customer Information</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium text-gray-600">Name:</span> {order.customer.name}</p>
                              <p><span className="font-medium text-gray-600">Email:</span> {order.customer.email}</p>
                              <p><span className="font-medium text-gray-600">Phone:</span> {order.customer.phone}</p>
                              <p>
                                <span className="font-medium text-gray-600">Address:</span> {order.customer.address}
                              </p>
                              <p><span className="font-medium text-gray-600">City:</span> <span className='uppercase'>{order.customer.city}</span></p>
                              <p><span className="font-medium text-gray-600">Country:</span><span className='uppercase'> {order.customer.country}</span></p>
                              <p><span className="font-medium text-gray-600">ZipCode:</span> {order.customer.zipCode}</p>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-100 rounded-2xl shadow-md p-4"
                          >
                            <div className="flex items-center mb-3">
                              <FiCalendar className="text-gray-500 mr-2" />
                              <h3 className="font-semibold text-gray-700">Order Details</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-600">Shipping</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newMethod = prompt("Enter new shipping method:", order.shippingMethod);
                                      if (newMethod && newMethod !== order.shippingMethod) {
                                        handleShippingMethodUpdate(order._id, newMethod);
                                      }
                                    }}
                                    className="text-cyan-600 hover:text-cyan-800 transition-colors"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                </div>
                                <p className="flex items-center mt-1">
                                  <FiTruck className="mr-1" /> {order.shippingMethod}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-600">Payment</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPaymentStatus(order._id);
                                    }}
                                    className="text-cyan-600 hover:text-cyan-800 transition-colors"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                </div>
                                {editingPaymentStatus === order._id ? (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-1 flex items-center space-x-2"
                                  >
                                    <select
                                      value={order.paymentStatus}
                                      onChange={(e) => handlePaymentStatusUpdate(order._id, e.target.value)}
                                      className="border rounded p-1 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                    >
                                      <option value="Paid">Paid</option>
                                      <option value="Pending">Pending</option>
                                      <option value="Unpaid">Unpaid</option>
                                    </select>
                                    <button
                                      onClick={() => setEditingPaymentStatus(null)}
                                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </motion.div>
                                ) : (
                                  <p className="flex items-center mt-1">
                                    <FiCreditCard className="mr-1" /> {order.paymentStatus}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Payment Method</p>
                                <p className="mt-1">{order.paymentMethod}</p>
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-600">Status</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingStatus(order._id);
                                    }}
                                    className="text-cyan-600 hover:text-cyan-800 transition-colors"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                </div>
                                {editingStatus === order._id ? (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-1 flex items-center space-x-2"
                                  >
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                      className="border rounded p-1 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Delivered">Delivered</option>
                                    </select>
                                    <button
                                      onClick={() => setEditingStatus(null)}
                                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </motion.div>
                                ) : (
                                  <p className="flex items-center mt-1">
                                    {getStatusIcon(order.status)} <span className="ml-1">{order.status}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-2 bg-gray-100 rounded-2xl shadow-md p-4"
                          >
                            {renderPaymentDetails(order)}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-2 bg-gray-300 rounded-2xl p-4"
                          >
                            <h3 className="font-bold text-gray-700 mb-3">Products Ordered ({order.totalQuantity} items)</h3>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-200">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-gray-100 divide-y divide-gray-300">
                                  {order.products?.map((product) => (
                                    <motion.tr
                                      key={product._id}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className="divide-x divide-gray-300" 
                                    >
                                      <td className="px-4 py-2 whitespace-nowrap border-r border-gray-300">
                                        <img
                                          src={product.image}
                                          alt={product.name}
                                          className="h-12 w-12 object-cover rounded-md border"
                                        />
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">
                                        {product.name}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300">
                                        {product.quantity}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300">
                                        Rs.{product.price.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        Rs.{product.totalPrice.toLocaleString()}
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>

                              </table>
                            </div>
                          </motion.div>
                        </div>

                        {/* Summary */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-6 flex justify-end"
                        >
                          <div className="bg-cyan-50 rounded-2xl shadow-lg p-4 w-full md:w-1/3">
                            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                              <span className="font-medium text-gray-600">Subtotal</span>
                              <span className="font-medium">Rs.{order.grandTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                              <span className="font-medium text-gray-600">Shipping</span>
                              <span className="font-medium">Rs.0</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-bold text-lg text-gray-800">Grand Total</span>
                              <span className="font-bold text-lg text-cyan-600">Rs.{order.grandTotal.toLocaleString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${page === pageNum ? 'bg-cyan-600 text-white' : 'bg-white text-gray-700'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;