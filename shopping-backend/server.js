// const express = require("express");
// const dotenv = require("dotenv");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const path = require("path");

// // Routes
// const paymentRoutes = require("./routes/paymentRoutes"); // Added payment routes
// // Include other routes like auth, category, subCategory, product, and order routes if needed
// const authRoutes = require("./routes/authRoutes");
// const categoryRoutes = require("./routes/categoryRoutes");
// const subCategoryRoutes = require("./routes/subCategoryRoutes");
// const productRoutes = require("./routes/productRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const stripeRoutes = require("./routes/stripeRoutes");

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors()); 
// app.use(express.json()); 

// // Static folder for uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Database Connection
// mongoose
//   .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("✅ Database Connected"))
//   .catch((err) => console.log("❌ Database Connection Error:", err));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api", categoryRoutes);
// app.use("/api", subCategoryRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/payments", paymentRoutes); // Added payment routes
// app.use("/api/stripe", stripeRoutes);

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });










const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const stripe = require("stripe")("sk_test_51RE6d5QR7soFUPBeZ3gvAuEZdYW54p77UsuGuGZALGdrwHJacPfCcClcNlJpmZNp6VBZHlWrASByKGkSSYIMJAsQ00T8MmZg3d");

// Import Routes
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Adjust according to your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stripe Checkout Endpoint
// Stripe Checkout Endpoint
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { lineItems } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.origin || 'http://localhost:5173'}/cart?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/cart`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Payment Verification Endpoint
app.get("/api/verify-payment", async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    res.json({
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});