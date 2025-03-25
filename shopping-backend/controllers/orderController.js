const Order = require('../models/orderModel');

// Helper function to calculate totals
const calculateOrderDetails = (products) => {
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const grandTotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    return { totalProducts, totalQuantity, grandTotal };
};

// 🟢 Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { customer, products, shippingMethod, paymentMethod, paymentStatus, status } = req.body;

        if (!customer || !products || !shippingMethod || !paymentMethod) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Total Calculation
        const totalProducts = products.length;
        const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
        const grandTotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

        // Create Order
        const newOrder = new Order({
            customer,
            products: products.map(p => ({ ...p, totalPrice: p.price * p.quantity })),
            totalProducts,
            totalQuantity,
            grandTotal,
            shippingMethod,
            paymentMethod,
            paymentStatus: paymentStatus || 'Unpaid',
            status: status || 'Pending'
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};
// 🟡 Get all orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 🔵 Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        res.status(200).json(order);
    } catch (error) {
        console.error('Get Order by ID Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 🟠 Update order (Full flexibility for any field)
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Apply Updates
        Object.assign(order, updates);

        if (updates.products) {
            const totalProducts = updates.products.length;
            const totalQuantity = updates.products.reduce((sum, p) => sum + p.quantity, 0);
            const grandTotal = updates.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
            order.products = updates.products.map(p => ({ ...p, totalPrice: p.price * p.quantity }));
            order.totalProducts = totalProducts;
            order.totalQuantity = totalQuantity;
            order.grandTotal = grandTotal;
        }

        await order.save();
        res.status(200).json(order);
    } catch (error) {
        console.error('Update Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// 🔴 Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete Order Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
