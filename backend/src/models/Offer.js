const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    discountLabel: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    code: {
      type: String,
      default: "",
      trim: true,
    },
    minimumOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Offer", offerSchema);
