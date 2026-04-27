const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "vendor"],
      default: "user",
    },
    restaurantName: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    coverImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    activationTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    activationExpiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

pendingRegistrationSchema.index({ activationExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PendingRegistration", pendingRegistrationSchema);
