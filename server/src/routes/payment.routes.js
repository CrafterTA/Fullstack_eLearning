const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/payment.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth.middleware");


router.get('/stats', authMiddleware, roleMiddleware(["Admin"]), PaymentController.getPaymentStats);
router.get("/", authMiddleware, PaymentController.getPayments);
router.post("/payos", authMiddleware, PaymentController.createPayOSPayment);
router.post('/payos/webhook', PaymentController.handlePayOSWebhook);
router.post('/payos/confirm-webhook', PaymentController.confirmWebhook); 
router.post('/payos/test-signature', PaymentController.testSignature);
router.post("/confirm", authMiddleware, PaymentController.confirmPayment);
router.post("/", authMiddleware, PaymentController.createPayment);


router.get('/:paymentId', authMiddleware, PaymentController.getPaymentById);
router.patch("/:paymentId/status", authMiddleware, roleMiddleware(["Admin"]), PaymentController.updatePaymentStatus);
router.delete("/:paymentId", authMiddleware, PaymentController.cancelPayment);

module.exports = router;