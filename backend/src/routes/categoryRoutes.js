const express = require("express");
const { createCategory, getCategories } = require("../controllers/categoryController");
const { authorize, protect, requireApprovedVendor } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, authorize("vendor"), requireApprovedVendor, createCategory);

module.exports = router;
