const express = require("express");
const {
  createFood,
  deleteFood,
  getPublicFoods,
  getVendorFoods,
  updateFood,
} = require("../controllers/foodController");
const { authorize, protect, requireApprovedVendor } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getPublicFoods);
router.get("/mine", protect, authorize("vendor"), requireApprovedVendor, getVendorFoods);
router.post("/", protect, authorize("vendor"), requireApprovedVendor, createFood);
router.patch("/:id", protect, authorize("vendor"), requireApprovedVendor, updateFood);
router.delete("/:id", protect, authorize("vendor"), requireApprovedVendor, deleteFood);

module.exports = router;
