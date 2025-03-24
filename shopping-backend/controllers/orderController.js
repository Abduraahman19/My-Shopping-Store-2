const Order = require('../models/orderModel');

exports.createOrder = async (req, res) => {
    try {
        const { customer, products, shippingMethod, paymentMethod } = req.body;

        if (!customer || !products || !shippingMethod || !paymentMethod) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
        const grandTotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

        const newOrder = new Order({
            customer,
            products: products.map(p => ({ ...p, totalPrice: p.price * p.quantity })),
            totalQuantity,
            grandTotal,
            shippingMethod,
            paymentMethod
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const order = await Order.findByIdAndUpdate(id, updates, { new: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
