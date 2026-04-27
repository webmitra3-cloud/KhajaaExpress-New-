const mongoose = require("mongoose");

const homeSlideSchema = new mongoose.Schema(
  {
    badge: {
      type: String,
      default: "KhajaExpress Picks",
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    ctaText: {
      type: String,
      default: "Explore Restaurants",
      trim: true,
    },
    ctaLink: {
      type: String,
      default: "/restaurants",
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("HomeSlide", homeSlideSchema);
