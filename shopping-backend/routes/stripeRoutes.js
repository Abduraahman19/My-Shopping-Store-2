const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe("sk_test_51RE6d5QR7soFUPBeZ3gvAuEZdYW54p77UsuGuGZALGdrwHJacPfCcClcNlJpmZNp6VBZHlWrASByKGkSSYIMJAsQ00T8MmZg3d");

router.post("/create-checkout-session", async (req, res) => {
  const { cartItems } = req.body;

  try {
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "http://localhost:5000/success",
      cancel_url: "http://localhost:5000/cancel",
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
