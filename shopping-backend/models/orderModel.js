const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true } // price * quantity
});

const orderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true },
        phone: { type: String, required: true },
        country: { type: String, required: true }
    },
    products: [productSchema],
    totalQuantity: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    shippingMethod: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);