const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require('cors');
const path = require("path");
const stripe = require("stripe")("sk_test_51RE6d5QR7soFUPBeZ3gvAuEZdYW54p77UsuGuGZALGdrwHJacPfCcClcNlJpmZNp6VBZHlWrASByKGkSSYIMJAsQ00T8MmZg3d");

const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Stripe Checkout Route
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { products, customer_email, success_url, cancel_url } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid products data" });
    }

    const lineItems = products.map(item => {
      const metadata = {
        product_id: item.product.id,
        description: item.product.description || '',
        brand: item.product.brand || '',
        category: item.product.category || ''
      };

      return {
        price_data: {
          currency: 'PKR',
          product_data: {
            name: item.product.title,
            description: item.product.description?.substring(0, 200) || '',
            metadata: metadata
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,

      // ✅ Additional fields added below
      customer_email: customer_email || undefined, // if provided, else optional
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['PK', 'US', 'CA'], // Add or remove as needed
      },
      customer_creation: 'always', // creates customer to capture name/email
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ 
      error: "Failed to create checkout session",
      details: error.message
    });
  }
});


// Payment Verification Route
app.get("/api/verify-payment", async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    res.json({
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total / 100
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ error: error.message || "Payment verification failed" });
  }
});

// Existing routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ My Shopping Store MongoDB Connected Successfully"))
  .catch(err => console.error("❌ My Shopping Store MongoDB Connection Error:", err));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 My Shopping Store Server running on port ${PORT}`);
  console.log(`🔗 My Shopping Store http://localhost:${PORT}`);
});