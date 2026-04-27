const mongoose = require("mongoose");
const { ORDER_STATUS } = require("../constants/orderStatus");

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    actorRole: {
      type: String,
      default: "system",
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "Khalti", "Dummy Online Payment"],
      default: "Cash on Delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Verification pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentDetails: {
      provider: {
        type: String,
        default: "",
        trim: true,
      },
      pidx: {
        type: String,
        default: "",
        trim: true,
      },
      transactionId: {
        type: String,
        default: "",
        trim: true,
      },
      mobile: {
        type: String,
        default: "",
        trim: true,
      },
      paymentUrl: {
        type: String,
        default: "",
        trim: true,
      },
      lookupStatus: {
        type: String,
        default: "",
        trim: true,
      },
      paidAt: {
        type: Date,
        default: null,
      },
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
