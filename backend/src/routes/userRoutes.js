const express = require("express");
const { getMyProfile, updateMyProfile } = require("../controllers/userController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, authorize("user", "vendor", "admin"), getMyProfile);
router.patch("/me", protect, authorize("user", "vendor", "admin"), updateMyProfile);

module.exports = router;
