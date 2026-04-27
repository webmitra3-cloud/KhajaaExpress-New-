const express = require("express");
const {
  getPublicVendors,
  getVendorReport,
  getVendorDashboard,
  getVendorDetails,
  getVendorProfile,
  updateVendorProfile,
} = require("../controllers/vendorController");
const { authorize, protect, requireApprovedVendor } = require("../middleware/authMiddleware");
const { createCategory, getCategories } = require("../controllers/categoryController");
const { createFood, deleteFood, getVendorFoods, updateFood } = require("../controllers/foodController");
const { createOffer, deleteOffer, getVendorOffers, updateOffer } = require("../controllers/offerController");
const { getVendorOrders, updateOrderStatus } = require("../controllers/orderController");

const router = express.Router();

router.get("/vendors", getPublicVendors);
router.get("/vendors/:id", getVendorDetails);

router.get("/vendor/dashboard", protect, authorize("vendor"), requireApprovedVendor, getVendorDashboard);
router.get("/vendor/reports", protect, authorize("vendor"), requireApprovedVendor, getVendorReport);
router.get("/vendor/profile", protect, authorize("vendor"), requireApprovedVendor, getVendorProfile);
router.patch("/vendor/profile", protect, authorize("vendor"), requireApprovedVendor, updateVendorProfile);
router.get("/vendor/categories", protect, authorize("vendor"), requireApprovedVendor, getCategories);
router.post("/vendor/categories", protect, authorize("vendor"), requireApprovedVendor, createCategory);
router.get("/vendor/offers", protect, authorize("vendor"), requireApprovedVendor, getVendorOffers);
router.post("/vendor/offers", protect, authorize("vendor"), requireApprovedVendor, createOffer);
router.patch("/vendor/offers/:id", protect, authorize("vendor"), requireApprovedVendor, updateOffer);
router.delete("/vendor/offers/:id", protect, authorize("vendor"), requireApprovedVendor, deleteOffer);
router.get("/vendor/foods", protect, authorize("vendor"), requireApprovedVendor, getVendorFoods);
router.post("/vendor/foods", protect, authorize("vendor"), requireApprovedVendor, createFood);
router.patch("/vendor/foods/:id", protect, authorize("vendor"), requireApprovedVendor, updateFood);
router.delete("/vendor/foods/:id", protect, authorize("vendor"), requireApprovedVendor, deleteFood);
router.get("/vendor/orders", protect, authorize("vendor"), requireApprovedVendor, getVendorOrders);
router.patch("/vendor/orders/:id/status", protect, authorize("vendor"), requireApprovedVendor, updateOrderStatus);

module.exports = router;
