const express = require("express");
const { uploadSingleImage } = require("../controllers/uploadController");
const uploadImage = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", uploadImage.single("image"), uploadSingleImage);

module.exports = router;
