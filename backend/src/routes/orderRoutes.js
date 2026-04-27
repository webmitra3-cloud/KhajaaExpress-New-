const express = require("express");
const {
  createOrder,
  createOrderReview,
  getOrderById,
  initiateKhaltiOrder,
  getUserOrders,
  verifyKhaltiPayment,
  updateOrderStatus,
} = require("../controllers/orderController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("user"), createOrder);
router.post("/khalti/initiate", protect, authorize("user"), initiateKhaltiOrder);
router.post("/khalti/verify", protect, authorize("user"), verifyKhaltiPayment);
router.get("/my", protect, authorize("user"), getUserOrders);
router.post("/:id/review", protect, authorize("user"), createOrderReview);
router.get("/:id", protect, authorize("user", "vendor", "admin"), getOrderById);
router.patch("/:id/status", protect, authorize("vendor", "admin"), updateOrderStatus);

module.exports = router;
