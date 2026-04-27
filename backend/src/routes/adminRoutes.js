const express = require("express");
const {
  approveVendor,
  createHomeSlide,
  deleteHomeSlide,
  getAllFoods,
  getAllOrders,
  getAllUsers,
  getAllVendors,
  getDashboardStats,
  getHomeSlides,
  getPendingVendors,
  getReports,
  rejectVendor,
  updateHomeSlide,
} = require("../controllers/adminController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/vendors", getAllVendors);
router.get("/vendors/pending", getPendingVendors);
router.patch("/vendors/:id/approve", approveVendor);
router.patch("/vendors/:id/reject", rejectVendor);
router.get("/foods", getAllFoods);
router.get("/orders", getAllOrders);
router.get("/reports", getReports);
router.get("/home-slides", getHomeSlides);
router.post("/home-slides", createHomeSlide);
router.patch("/home-slides/:id", updateHomeSlide);
router.delete("/home-slides/:id", deleteHomeSlide);

module.exports = router;
