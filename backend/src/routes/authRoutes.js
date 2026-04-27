const express = require("express");
const { activateRegistration, getCurrentUser, login, register } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/activate", activateRegistration);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);

module.exports = router;
