const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

// Initialize Stripe with environment variable
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_51RE6d5QR7soFUPBeZ3gvAuEZdYW54p77UsuGuGZALGdrwHJacPfCcClcNlJpmZNp6VBZHlWrASByKGkSSYIMJAsQ00T8MmZg3d");

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { lineItems, customerEmail, customerName } = req.body;

    // Validate required fields
    if (!lineItems || !Array.isArray(lineItems)) {
      return res.status(400).json({ error: "Invalid line items" });
    }
    if (!customerEmail) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems.map(item => ({
        price_data: {
          currency: "pkr",
          product_data: {
            name: item.price_data.product_data.name,
            images: item.price_data.product_data.images,
          },
          unit_amount: item.price_data.unit_amount,
        },
        quantity: item.quantity,
      })),
      customer_email: customerEmail,
      metadata: {
        customerName: customerName || "Anonymous",
      },
      success_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/cancel`,
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to create checkout session",
      details: error.raw ? error.raw.message : undefined
    });
  }
});

module.exports = router;