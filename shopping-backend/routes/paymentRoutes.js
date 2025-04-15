const express = require("express");
const multer = require("multer");
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentById,
  deletePaymentById,
} = require("../controllers/paymentController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("paymentProof"), createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.put("/:id", updatePaymentById);
router.delete("/:id", deletePaymentById);

module.exports = router;
