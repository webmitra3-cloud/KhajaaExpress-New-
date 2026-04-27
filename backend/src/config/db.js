const mongoose = require("mongoose");
const Order = require("../models/Order");

const syncOrderIndexes = async () => {
  const collections = await mongoose.connection.db
    .listCollections({ name: Order.collection.collectionName })
    .toArray();

  if (!collections.length) {
    return;
  }

  const indexes = await Order.collection.indexes();
  const hadLegacyOrderCodeIndex = indexes.some((index) => index.name === "orderCode_1");

  await Order.syncIndexes();

  if (hadLegacyOrderCodeIndex) {
    console.log("Dropped legacy orderCode index from orders collection");
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    await syncOrderIndexes();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
