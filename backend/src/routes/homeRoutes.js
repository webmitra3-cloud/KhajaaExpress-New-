const express = require("express");
const { getHomePageData } = require("../controllers/homeController");

const router = express.Router();

router.get("/", getHomePageData);

module.exports = router;
