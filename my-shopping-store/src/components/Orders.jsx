import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiPackage, FiTruck, FiCreditCard, FiUser,
  FiCalendar, FiEdit, FiChevronDown, FiFile, FiX
} from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const OrderManagement = () => {
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
  const [currentImage, setCurrentImage] = useState('');
  const [currentImageType, setCurrentImageType] = useState('');
  const [viewType, setViewType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let ordersData = [];
        let transactionsData = [];
        let paymentsData = [];
        let totalCount = 0;

        if (viewType === 'all' || viewType === 'orders') {
          const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
            params: {
              page,
              limit: 10,
              status: viewType === 'all' ? statusFilter : statusFilter || undefined,
              paymentStatus: viewType === 'all' ? paymentStatusFilter : paymentStatusFilter || undefined
            }
          });

          ordersData = ordersResponse.data?.orders ||
            (Array.isArray(ordersResponse.data) ? ordersResponse.data : []);

          if (viewType === 'orders') {
            totalCount = ordersResponse.data?.total || ordersData.length;
          }
        }

        if (viewType === 'all' || viewType === 'transactions') {
          const [paymentsResponse, transactionsResponse] = await Promise.all([
            axios.get('http://localhost:5000/api/payments'),
            axios.get('http://localhost:5000/api/transactions', {
              params: {
                page,
                limit: 10,
                status: viewType === 'all' ? statusFilter : statusFilter || undefined,
                'paymentDetails.status': viewType === 'all' ? paymentStatusFilter : paymentStatusFilter || undefined
              }
            })
          ]);

          paymentsData = paymentsResponse.data?.payments ||
            (Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);

          try {
            transactionsData = transactionsResponse.data?.transactions ||
              transactionsResponse.data?.data ||
              (Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
          } catch (e) {
            console.error("Error processing transactions data:", e);
            transactionsData = [];
          }

          if (viewType === 'transactions') {
            totalCount = transactionsResponse.data?.total || transactionsData.length;
          }
        }

        const transactionsAsOrders = transactionsData.map(transaction => {
          const customer = transaction.user || {};
          const address = customer.address || {};
          const items = transaction.cartItems || [];
          const paymentDetails = transaction.paymentDetails || {};
          const cardDetails = paymentDetails.card || {};

          const subtotal = transaction.paymentDetails?.amount ||
            items.reduce((sum, item) => sum + ((item.product?.price || 0) * (item.quantity || 0)), 0);

          return {
            _id: transaction._id,
            isTransaction: true,
            customer: {
              name: customer.name || 'Customer',
              email: customer.email || 'email@example.com',
              phone: customer.phone || '000-000-0000',
              address: address.line1 || 'Address not provided',
              city: address.city || 'CITY NOT PROVIDED',
              country: address.country || 'COUNTRY NOT PROVIDED',
              zipCode: address.postal_code || '00000'
            },
            products: items.map(item => ({
              _id: item.product?._id || Math.random().toString(36).substr(2, 9),
              name: item.product?.title || 'Product',
              price: item.product?.price || 0,
              quantity: item.quantity || 0,
              totalPrice: (item.product?.price || 0) * (item.quantity || 0),
              image: item.product?.image || 'https://via.placeholder.com/150'
            })),
            totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
            grandTotal: subtotal,
            paymentMethod: 'Card Payment',
            paymentStatus: paymentDetails.status || 'requires_payment_method',
            status: transaction.status || 'processing',
            shippingMethod: transaction.shippingMethod || 'Standard Shipping',
            createdAt: transaction.createdAt || new Date().toISOString(),
            payment: {
              method: 'card',
              details: {
                ...paymentDetails,
                card: cardDetails,
                receiptUrl: paymentDetails.receiptUrl
              },
              orderId: transaction._id
            }
          };
        });

        const allOrders = [...ordersData, ...transactionsAsOrders];

        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const ordersWithPayments = allOrders.map(order => {
          const payment = paymentsData.find(p => p.orderId === order._id) || order.payment;
          return {
            ...order,
            payment: payment || {
              method: order.paymentMethod || 'Unknown',
              details: {},
              orderId: order._id
            }
          };
        });

        setOrders(ordersWithPayments);

        if (viewType === 'all') {
          setTotalPages(Math.max(
            ordersData.pages || 1,
            transactionsData.pages || 1
          ));
          setTotalOrders(ordersData.length + transactionsData.length);
        } else {
          setTotalPages(Math.ceil(totalCount / 10) || 1);
          setTotalOrders(totalCount);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || err.message || "Failed to fetch data.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, statusFilter, paymentStatusFilter, viewType]);

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
    setEditingStatus(null);
    setEditingPaymentStatus(null);
  };

  const handleStatusUpdate = async (orderId, newStatus, isTransaction) => {
    try {
      const endpoint = isTransaction
        ? `http://localhost:5000/api/transactions/${orderId}`
        : `http://localhost:5000/api/orders/${orderId}`;

      const response = await axios.put(endpoint, {
        status: newStatus
      });

      if (response.data) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success('Status updated successfully');
        setEditingStatus(null);
      } else {
        throw new Error(response.data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to update status');
    }
  };

  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus, isTransaction) => {
    try {
      const endpoint = isTransaction
        ? `http://localhost:5000/api/transactions/${orderId}`
        : `http://localhost:5000/api/orders/${orderId}`;

      const payload = isTransaction
        ? { 'paymentDetails.status': newPaymentStatus }
        : { paymentStatus: newPaymentStatus };

      const response = await axios.put(endpoint, payload);

      if (response.data) {
        setOrders(orders.map(order => {
          if (order._id === orderId) {
            if (isTransaction) {
              return {
                ...order,
                payment: {
                  ...order.payment,
                  details: {
                    ...order.payment.details,
                    status: newPaymentStatus
                  }
                },
                paymentStatus: newPaymentStatus
              };
            }
            return { ...order, paymentStatus: newPaymentStatus };
          }
          return order;
        }));
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

  const handleShippingMethodUpdate = async (orderId, newShippingMethod, isTransaction) => {
    try {
      const endpoint = isTransaction
        ? `http://localhost:5000/api/transactions/${orderId}`
        : `http://localhost:5000/api/orders/${orderId}`;

      const response = await axios.put(endpoint, {
        shippingMethod: newShippingMethod
      });

      if (response.data) {
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
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'shipped':
        return <FiTruck className="text-blue-500" />;
      case 'canceled':
      case 'failed':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'succeeded':
        return <FaCheckCircle className="text-green-500" />;
      case 'failed':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const openImageModal = (imageUrl, type) => {
    setCurrentImage(imageUrl);
    setCurrentImageType(type);
    setIsImageModalOpen(true);
  };

  const renderPaymentDetails = (order) => {
    if (!order.payment) {
      return (
        <div className="text-center py-4 text-gray-500">
          <p>No payment details available for this {order.isTransaction ? 'transaction' : 'order'}</p>
        </div>
      );
    }

    const payment = order.payment;
    const details = payment.details || {};

    const renderDetails = () => {
      if (order.isTransaction) {
        if (payment.method === 'card' && details.card) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600">Card Brand</p>
                <p className="text-gray-800 capitalize">
                  {details.card.brand || 'Visa/Mastercard'} 
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Card last 4 Digits</p>
                <p className="text-gray-800">
                  {details.card.last4 ? `•••• •••• •••• ${details.card.last4}` : '•••• •••• •••• 4242'} 
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Expiration Date</p>
                <p className="text-gray-800">
                  {details.card.exp_month && details.card.exp_year
                    ? `${details.card.exp_month}/${details.card.exp_year.toString().slice(-2)}`
                    : 'MM/YY'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Payment Intent ID</p>
                <p className="text-gray-800 font-mono text-sm break-all">
                  {details.paymentIntentId || 'Not available'}
                </p>
              </div>

              {details.receiptUrl && (
                <div className="md:col-span-2">
                  <a
                    href={details.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:underline flex items-center"
                  >
                    <FiFile className="mr-2" />
                    View Stripe Receipt
                  </a>
                </div>
              )}
            </div>
          );
        }
        <td className="px-4 py-2 whitespace-nowrap border-r border-gray-300">
          <div
            className="cursor-pointer"
            onClick={() => openImageModal(
              product.image || 'https://via.placeholder.com/150?text=No+Image',
              'product'
            )}
          >
            <img
              src={product.image || 'https://via.placeholder.com/150?text=No+Image'}
              alt={product.name}
              className="h-12 w-12 object-cover rounded-md border hover:shadow-md transition-shadow"
            />
          </div>
        </td>
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-600">Payment Method</p>
              <p className="text-gray-800 capitalize">{payment.method || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Status</p>
              <p className="text-gray-800 capitalize">{details.status || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Amount</p>
              <p className="text-gray-800">Rs.{details.amount?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Currency</p>
              <p className="text-gray-800 uppercase">{details.currency || 'PKR'}</p>
            </div>
          </div>
        );
      } else {
        switch (payment.method) {
          case 'Easypaisa':
          case 'Jazz Cash':
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-600">Mobile Number</p>
                  <p className="text-gray-800">{details.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Transaction ID</p>
                  <p className="text-gray-800">{details.transactionId || 'N/A'}</p>
                </div>
                {details.cnic && (
                  <div>
                    <p className="font-medium text-gray-600">CNIC</p>
                    <p className="text-gray-800">{details.cnic}</p>
                  </div>
                )}
              </div>
            );
          case 'Bank Account Transfer':
          case 'Bank Transfer':
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-600">Account Title</p>
                  <p className="text-gray-800">{details.accountTitle || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Bank Name</p>
                  <p className="text-gray-800">{details.bankName || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Account Number</p>
                  <p className="text-gray-800">{details.accountNumber || details.senderAccountNumber || 'N/A'}</p>
                </div>
                {details.transferDate && (
                  <div>
                    <p className="font-medium text-gray-600">Transfer Date</p>
                    <p className="text-gray-800">{details.transferDate}</p>
                  </div>
                )}
              </div>
            );
          case 'Cash on Delivery':
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-600">Recipient Name</p>
                  <p className="text-gray-800">{details.recipientName || order.customer.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Delivery Address</p>
                  <p className="text-gray-800">{details.deliveryAddress || order.customer.address || 'N/A'}</p>
                </div>
              </div>
            );
          default:
            return (
              <div>
                <p className="text-gray-500">Payment method: {payment.method}</p>
                {Object.keys(details).length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-600">Additional Details:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
        }
      }
    };

    return (
      <div className="mt-4">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
          <FiCreditCard className="mr-2" />
          Payment Details ({payment.method || 'Unknown'})
        </h4>
        {renderDetails()}

        {details.paymentProof && !order.isTransaction && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FiFile className="mr-2" />
              Payment Proof
            </h4>
            <div className="border rounded-2xl p-4 bg-gray-50">
              {details.paymentProof.endsWith('.pdf') ? (
                <div>
                  <a
                    href={`http://localhost:5000/${details.paymentProof}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:underline flex items-center mb-2"
                  >
                    <FiFile className="mr-2" />
                    View PDF Receipt
                  </a>
                  <iframe
                    src={`http://localhost:5000/${details.paymentProof}`}
                    className="w-full h-64 border rounded"
                    title="Payment proof PDF"
                  />
                </div>
              ) : (
                <div className="relative group cursor-pointer w-fit mx-auto">
                  <div
                    className="relative overflow-hidden rounded-2xl border-2 border-gray-200 group-hover:border-indigo-400 transition-all duration-300"
                    onClick={() => openImageModal(`http://localhost:5000/${details.paymentProof}`, 'payment')}
                  >
                    <img
                      src={`http://localhost:5000/${details.paymentProof}`}
                      alt="Payment proof thumbnail"
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/90 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-indigo-600"
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
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ImageModal = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsImageModalOpen(false)}
      >
        <div className="relative w-full max-w-6xl max-h-[90vh]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsImageModalOpen(false);
            }}
            className="absolute -top-12 -right-12 rounded-full text-white bg-white/20 hover:bg-white/30 transition-colors p-3"
            aria-label="Close modal"
          >
            <FiX className="h-6 w-6" />
          </button>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {currentImageType === 'payment' ? (
              <img
                src={currentImage}
                alt="Payment proof"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            ) : (
              <div className="p-6">
                <h3 className="text-xl text-white font-bold mb-4">Product Image</h3>
                <img
                  src={currentImage}
                  alt="Product"
                  className="w-auto h-auto max-h-[70vh] rounded-2xl mx-auto"
                />
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center w-screen h-screen bg-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        className="rounded-full h-20 w-20 border-4 border-t-indigo-700/30 border-b-indigo-700 border-l-indigo-700/30 border-r-indigo-700"
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
      <AnimatePresence>
        {isImageModalOpen && <ImageModal />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
          <FiPackage className="mr-3 text-indigo-600" />
          Orders Management
        </h1>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewType('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${viewType === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setViewType('orders')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${viewType === 'orders' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Orders
            </button>
            <button
              onClick={() => setViewType('transactions')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${viewType === 'transactions' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Card Payment Orders
            </button>
          </div>

          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Showing {((page - 1) * 10) + 1}-{Math.min(page * 10, totalOrders)} of {totalOrders} records
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <label className="mr-2 text-lg font-bold text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded p-2 text-gray-700 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Statuses</option>
            {viewType !== 'transactions' && (
              <>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </>
            )}
            {viewType !== 'orders' && (
              <>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </>
            )}
          </select>
        </div>

        <div className="flex items-center">
          <label className="mr-2 text-lg font-bold text-gray-700">Payment:</label>
          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded p-2 text-gray-700 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Payments</option>
            {viewType !== 'transactions' && (
              <>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Unpaid">Unpaid</option>
              </>
            )}
            {viewType !== 'orders' && (
              <>
                <option value="succeeded">Succeeded</option>
                <option value="requires_payment_method">Requires Payment</option>
                <option value="failed">Failed</option>
              </>
            )}
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
          <h2 className="text-xl font-semibold text-gray-700">No Records Found</h2>
          <p className="text-gray-500 mt-2">Your {viewType === 'all' ? 'order and transaction' : viewType} list is currently empty</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const orderNumber = ((page - 1) * 10) + index + 1;
            const isTransaction = order.isTransaction;
            const paymentStatus = isTransaction
              ? order.payment?.details?.status || 'requires_payment_method'
              : order.paymentStatus;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${expandedOrder === order._id ? 'ring-2 ring-indigo-500' : 'hover:shadow-lg'}`}
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
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                      <FiPackage className="text-xl" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800">
                        {isTransaction ? 'Card Payment Orders' : 'Order'} #{order._id.slice(-8).toUpperCase()}
                      </h2>
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
                      <span className={`text-xs sm:text-sm font-medium ${['delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'text-green-600' :
                          ['shipped'].includes(order.status?.toLowerCase()) ? 'text-blue-600' :
                            ['canceled', 'failed'].includes(order.status?.toLowerCase()) ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-2">
                      {getPaymentStatusIcon(paymentStatus)}
                      <span className={`text-xs sm:text-sm font-medium ${['paid', 'succeeded'].includes(paymentStatus?.toLowerCase()) ? 'text-green-600' :
                          ['failed'].includes(paymentStatus?.toLowerCase()) ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                        {paymentStatus.replace('_', ' ')}
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
                            <div className="space-y-2 text-sm text-gray-800 font-semibold">
                              <p><span className="font-bold text-gray-600">Name:</span> {order.customer.name}</p>
                              <p><span className="font-bold text-gray-600">Email:</span> {order.customer.email}</p>
                              <p><span className="font-bold text-gray-600">Phone:</span> {order.customer.phone}</p>
                              <p>
                                <span className="font-bold text-gray-600">Address:</span> {order.customer.address}
                              </p>
                              <p><span className="font-bold text-gray-600">City:</span> <span className='uppercase'>{order.customer.city}</span></p>
                              <p><span className="font-bold text-gray-600">Country:</span><span className='uppercase'> {order.customer.country}</span></p>
                              <p><span className="font-bold text-gray-600">ZipCode:</span> {order.customer.zipCode}</p>
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
                              <h3 className="font-semibold text-gray-700">
                                {isTransaction ? 'Transaction' : 'Order'} Details
                              </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-gray-600">Shipping</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newMethod = prompt("Enter new shipping method:", order.shippingMethod);
                                      if (newMethod && newMethod !== order.shippingMethod) {
                                        handleShippingMethodUpdate(order._id, newMethod, isTransaction);
                                      }
                                    }}
                                    className="text-cyan-600 hover:text-cyan-800 transition-colors"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                </div>
                                <p className="flex items-center text-gray-800 mt-1">
                                  <FiTruck className="mr-1 text-cyan-600" /> {order.shippingMethod}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-gray-600">Payment</p>
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
                                      value={paymentStatus}
                                      onChange={(e) => handlePaymentStatusUpdate(order._id, e.target.value, isTransaction)}
                                      className="border text-gray-800 rounded p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    >
                                      {isTransaction ? (
                                        <>
                                          <option value="succeeded">Succeeded</option>
                                          <option value="requires_payment_method">Requires Payment</option>
                                          <option value="failed">Failed</option>
                                        </>
                                      ) : (
                                        <>
                                          <option value="Paid">Paid</option>
                                          <option value="Pending">Pending</option>
                                          <option value="Unpaid">Unpaid</option>
                                        </>
                                      )}
                                    </select>
                                    <button
                                      onClick={() => setEditingPaymentStatus(null)}
                                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </motion.div>
                                ) : (
                                  <p className="flex items-center text-gray-800 mt-1">
                                    <FiCreditCard className="mr-1" /> {paymentStatus.replace('_', ' ')}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-600">Payment Method</p>
                                <p className="mt-1 text-gray-800 capitalize">{order.paymentMethod}</p>
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-gray-600">Status</p>
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
                                      onChange={(e) => handleStatusUpdate(order._id, e.target.value, isTransaction)}
                                      className="border rounded text-gray-800 p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    >
                                      {isTransaction ? (
                                        <>
                                          <option value="processing">Processing</option>
                                          <option value="shipped">Shipped</option>
                                          <option value="completed">Completed</option>
                                          <option value="canceled">Canceled</option>
                                        </>
                                      ) : (
                                        <>
                                          <option value="Pending">Pending</option>
                                          <option value="Processing">Processing</option>
                                          <option value="Shipped">Shipped</option>
                                          <option value="Delivered">Delivered</option>
                                        </>
                                      )}
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
                                    {getStatusIcon(order.status)} <span className="ml-1 text-gray-800">{order.status}</span>
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
                                        <div
                                          className="cursor-pointer"
                                          onClick={() => openImageModal(product.image, 'product')}
                                        >
                                          <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-12 w-12 object-cover rounded-md border hover:shadow-md transition-shadow"
                                          />
                                        </div>
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

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-6 flex justify-end"
                        >
                          <div className="bg-indigo-100 rounded-2xl shadow-lg p-4 w-full md:w-1/3">
                            <div className="flex justify-between items-center border-b border-white pb-2 mb-2">
                              <span className="font-bold text-gray-600">Subtotal</span>
                              <span className="font-medium text-gray-800">Rs.{order.grandTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white pb-2 mb-2">
                              <span className="font-bold text-gray-600">Shipping</span>
                              <span className="font-medium text-gray-800">Rs.0</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-bold text-lg text-gray-800">Grand Total</span>
                              <span className="font-bold text-lg text-indigo-600">Rs.{order.grandTotal.toLocaleString()}</span>
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

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border bg-black/10 text-gray-700 rounded-md text-sm font-medium disabled:opacity-50"
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
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${page === pageNum ? 'bg-indigo-600 text-white' : 'bg-indigo-600/10 text-gray-700'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border bg-black/10 text-gray-700 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;