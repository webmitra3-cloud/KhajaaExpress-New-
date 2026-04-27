const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const offerRoutes = require("./routes/offerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use((req, res, next) => {
  req.io = req.app.get("io");
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/home", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", vendorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
