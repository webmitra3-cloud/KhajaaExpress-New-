const Food = require("../models/Food");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Vendor = require("../models/Vendor");
const { ORDER_STATUS } = require("../constants/orderStatus");
const { buildOrderNumber, canTransitionStatus } = require("../utils/orderHelpers");
const { initiateKhaltiPayment, lookupKhaltiPayment } = require("../utils/khaltiService");
const { createNotification } = require("../utils/notificationService");
const { getWebsiteUrl } = require("../utils/url");

const VENDOR_VISIBLE_ORDER_FILTER = {
  $or: [{ paymentMethod: "Cash on Delivery" }, { paymentMethod: "Dummy Online Payment" }, { paymentStatus: "Paid" }],
};

const ORDER_POPULATION = [
  { path: "user", select: "name email phone address" },
  { path: "vendor", select: "restaurantName address phone user" },
  {
    path: "review",
    populate: {
      path: "user",
      select: "name avatarUrl",
    },
  },
];

const applyOrderPopulation = (query) => {
  ORDER_POPULATION.forEach((item) => {
    query.populate(item);
  });

  return query;
};

const amountToPaisa = (value) => Math.round(Number(value || 0) * 100);

const getVendorOrderFilter = (vendorId) => ({
  vendor: vendorId,
  ...VENDOR_VISIBLE_ORDER_FILTER,
});

const ensurePaymentDetails = (order) => {
  if (!order.paymentDetails) {
    order.paymentDetails = {};
  }

  return order.paymentDetails;
};

const buildCustomerInfo = (user) => ({
  name: user.name || "KhajaExpress Customer",
  email: user.email,
  phone: user.phone || "9800000001",
});

const buildOrderItems = async (vendorId, items) => {
  const foodIds = items.map((item) => item.foodId);
  const foods = await Food.find({
    _id: { $in: foodIds },
    vendor: vendorId,
    isAvailable: true,
  });

  if (foods.length !== items.length) {
    const error = new Error("One or more items are unavailable");
    error.statusCode = 400;
    throw error;
  }

  const foodMap = new Map(foods.map((food) => [String(food._id), food]));
  let totalPrice = 0;

  const orderItems = items.map((item) => {
    const food = foodMap.get(String(item.foodId));
    const quantity = Math.max(1, Number(item.quantity) || 1);

    totalPrice += food.price * quantity;

    return {
      food: food._id,
      name: food.name,
      price: food.price,
      quantity,
      imageUrl: food.imageUrl,
    };
  });

  return {
    foods,
    orderItems,
    totalPrice,
  };
};

const prepareOrderData = async ({ user, vendorId, items, deliveryAddress, notes, paymentMethod }) => {
  if (!vendorId || !Array.isArray(items) || items.length === 0) {
    const error = new Error("Vendor and order items are required");
    error.statusCode = 400;
    throw error;
  }

  const vendor = await Vendor.findOne({
    _id: vendorId,
    approvalStatus: "approved",
  });

  if (!vendor) {
    const error = new Error("Vendor not found");
    error.statusCode = 404;
    throw error;
  }

  const { orderItems, totalPrice } = await buildOrderItems(vendor._id, items);

  return {
    vendor,
    orderData: {
      orderNumber: buildOrderNumber(),
      user: user._id,
      vendor: vendor._id,
      items: orderItems,
      totalPrice,
      paymentMethod,
      deliveryAddress: deliveryAddress || user.address || "Please update your address",
      notes: notes || "",
      status: ORDER_STATUS.PLACED,
      statusHistory: [
        {
          status: ORDER_STATUS.PLACED,
          changedAt: new Date(),
          note: paymentMethod === "Khalti" ? "Waiting for Khalti payment confirmation" : "Order submitted successfully",
          actorRole: "user",
        },
      ],
    },
  };
};

const cancelOrderForPaymentFailure = async (order, note) => {
  if (order.status === ORDER_STATUS.CANCELLED || order.status === ORDER_STATUS.DELIVERED) {
    return;
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.statusHistory.push({
    status: ORDER_STATUS.CANCELLED,
    changedAt: new Date(),
    note,
    actorRole: "system",
  });

  await order.save();
};

const populateOrderById = (orderId) =>
  applyOrderPopulation(Order.findById(orderId)).populate({
    path: "vendor",
    select: "restaurantName address phone user",
    populate: {
      path: "user",
      select: "name email",
    },
  });

const createOrder = async (req, res, next) => {
  try {
    const paymentMethod = req.body.paymentMethod || "Cash on Delivery";

    if (paymentMethod !== "Cash on Delivery") {
      res.status(400);
      throw new Error("Use the Khalti checkout flow for online payments");
    }

    const { vendor, orderData } = await prepareOrderData({
      user: req.user,
      vendorId: req.body.vendorId,
      items: req.body.items,
      deliveryAddress: req.body.deliveryAddress,
      notes: req.body.notes,
      paymentMethod,
    });

    const order = await Order.create({
      ...orderData,
      paymentStatus: "Pending",
      paymentDetails: {
        provider: "Cash on Delivery",
      },
    });

    const populatedOrder = await populateOrderById(order._id);

    await createNotification(req.io, {
      recipient: vendor.user,
      type: "order",
      title: "New cash on delivery order",
      message: `Order #${order.orderNumber} was placed and is waiting for confirmation.`,
      link: "/vendor/orders",
      metadata: {
        orderId: order._id,
      },
    });

    await createNotification(req.io, {
      recipient: req.user._id,
      type: "order",
      title: "Order placed",
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      link: "/user/orders",
      metadata: {
        orderId: order._id,
      },
    });

    res.status(201).json({
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const initiateKhaltiOrder = async (req, res, next) => {
  try {
    const { vendor, orderData } = await prepareOrderData({
      user: req.user,
      vendorId: req.body.vendorId,
      items: req.body.items,
      deliveryAddress: req.body.deliveryAddress,
      notes: req.body.notes,
      paymentMethod: "Khalti",
    });

    const order = await Order.create({
      ...orderData,
      paymentStatus: "Verification pending",
      paymentDetails: {
        provider: "Khalti",
      },
    });

    try {
      const websiteUrl = getWebsiteUrl();
      const khaltiResponse = await initiateKhaltiPayment({
        amount: amountToPaisa(order.totalPrice),
        purchaseOrderId: order.orderNumber,
        purchaseOrderName: `${vendor.restaurantName} order`,
        returnUrl: `${websiteUrl}/payment/khalti/callback`,
        websiteUrl,
        customerInfo: buildCustomerInfo(req.user),
      });

      const paymentDetails = ensurePaymentDetails(order);
      paymentDetails.provider = "Khalti";
      paymentDetails.pidx = khaltiResponse.pidx;
      paymentDetails.paymentUrl = khaltiResponse.payment_url;
      paymentDetails.lookupStatus = "Initiated";
      await order.save();

      res.status(201).json({
        message: "Khalti payment initiated successfully",
        orderId: order._id,
        orderNumber: order.orderNumber,
        pidx: khaltiResponse.pidx,
        paymentUrl: khaltiResponse.payment_url,
        expiresAt: khaltiResponse.expires_at,
      });
    } catch (error) {
      await Order.deleteOne({ _id: order._id });
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

const verifyKhaltiPayment = async (req, res, next) => {
  try {
    const { pidx, purchaseOrderId, transactionId, mobile } = req.body;

    if (!pidx || !purchaseOrderId) {
      res.status(400);
      throw new Error("Payment verification requires pidx and purchase order id");
    }

    const order = await Order.findOne({
      orderNumber: purchaseOrderId,
      user: req.user._id,
      paymentMethod: "Khalti",
    }).populate("vendor", "restaurantName user");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.paymentStatus === "Paid") {
      const populatedOrder = await populateOrderById(order._id);

      res.json({
        message: "Payment already verified",
        order: populatedOrder,
      });
      return;
    }

    const lookup = await lookupKhaltiPayment(pidx);

    if (Number(lookup.total_amount || 0) !== amountToPaisa(order.totalPrice)) {
      res.status(400);
      throw new Error("Khalti amount does not match the order total");
    }

    const paymentDetails = ensurePaymentDetails(order);
    paymentDetails.provider = "Khalti";
    paymentDetails.pidx = pidx;
    paymentDetails.lookupStatus = lookup.status || "";
    paymentDetails.transactionId = lookup.transaction_id || transactionId || "";
    paymentDetails.mobile = mobile || req.body.mobile || "";

    if (lookup.status === "Completed") {
      order.paymentStatus = "Paid";
      paymentDetails.paidAt = new Date();
      await order.save();

      await createNotification(req.io, {
        recipient: order.vendor.user,
        type: "payment",
        title: "New prepaid order received",
        message: `Order #${order.orderNumber} was paid successfully through Khalti.`,
        link: "/vendor/orders",
        metadata: {
          orderId: order._id,
        },
      });

      await createNotification(req.io, {
        recipient: req.user._id,
        type: "payment",
        title: "Khalti payment verified",
        message: `Your payment for order #${order.orderNumber} was verified successfully.`,
        link: "/user/orders",
        metadata: {
          orderId: order._id,
        },
      });
    } else if (lookup.status === "Refunded" || lookup.status === "Partially Refunded") {
      order.paymentStatus = "Refunded";
      await order.save();
      await cancelOrderForPaymentFailure(order, "Khalti payment was refunded");
    } else if (lookup.status === "Expired" || lookup.status === "User canceled") {
      order.paymentStatus = "Failed";
      await order.save();
      await cancelOrderForPaymentFailure(order, `Khalti payment ${String(lookup.status || "").toLowerCase()}`);
    } else {
      order.paymentStatus = "Verification pending";
      await order.save();
    }

    const populatedOrder = await populateOrderById(order._id);

    res.json({
      message: lookup.status === "Completed" ? "Payment verified successfully" : `Payment status: ${lookup.status}`,
      lookup,
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await applyOrderPopulation(Order.find({ user: req.user._id }))
      .populate("vendor", "restaurantName address phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getVendorOrders = async (req, res, next) => {
  try {
    const orders = await applyOrderPopulation(Order.find(getVendorOrderFilter(req.vendor._id)))
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await populateOrderById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (req.user.role === "user" && String(order.user._id) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Access denied");
    }

    if (req.user.role === "vendor") {
      const vendor = req.vendor || (await Vendor.findOne({ user: req.user._id }));

      if (!vendor || String(order.vendor._id) !== String(vendor._id)) {
        res.status(403);
        throw new Error("Access denied");
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      res.status(400);
      throw new Error("Status is required");
    }

    const order = await Order.findById(req.params.id).populate("vendor", "user restaurantName");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (req.user.role === "vendor" && String(order.vendor.user) !== String(req.user._id)) {
      res.status(403);
      throw new Error("You can only update your own orders");
    }

    if (order.paymentMethod === "Khalti" && order.paymentStatus !== "Paid") {
      res.status(400);
      throw new Error("This Khalti order cannot be processed until the payment is verified");
    }

    if (!canTransitionStatus(order.status, status)) {
      res.status(400);
      throw new Error("Invalid order status update");
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      note: `Status changed to ${status}`,
      actorRole: req.user.role,
    });

    if (status === ORDER_STATUS.DELIVERED && order.paymentMethod === "Cash on Delivery" && order.paymentStatus !== "Paid") {
      const paymentDetails = ensurePaymentDetails(order);
      order.paymentStatus = "Paid";
      paymentDetails.provider = "Cash on Delivery";
      paymentDetails.paidAt = new Date();
    }

    await order.save();

    const updatedOrder = await populateOrderById(order._id);

    await createNotification(req.io, {
      recipient: updatedOrder.user._id,
      type: "order",
      title: "Order status updated",
      message: `Order #${updatedOrder.orderNumber} is now ${status}.`,
      link: "/user/orders",
      metadata: {
        orderId: updatedOrder._id,
        status,
      },
    });

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const createOrderReview = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();
    const itemRatings = Array.isArray(req.body.itemRatings) ? req.body.itemRatings : [];

    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error("Overall rating must be between 1 and 5");
    }

    const order = await Order.findById(req.params.id).populate("vendor", "restaurantName user");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (String(order.user) !== String(req.user._id)) {
      res.status(403);
      throw new Error("You can only review your own order");
    }

    if (order.status !== ORDER_STATUS.DELIVERED) {
      res.status(400);
      throw new Error("Only delivered orders can be reviewed");
    }

    if (order.review) {
      res.status(400);
      throw new Error("This order has already been reviewed");
    }

    const orderItemsMap = new Map(order.items.map((item) => [String(item.food), item]));
    const normalizedItemRatings = itemRatings
      .map((item) => {
        const orderItem = orderItemsMap.get(String(item.foodId));
        const itemRating = Number(item.rating);

        if (!orderItem || !itemRating || itemRating < 1 || itemRating > 5) {
          return null;
        }

        return {
          food: orderItem.food,
          name: orderItem.name,
          rating: itemRating,
          comment: String(item.comment || "").trim(),
        };
      })
      .filter(Boolean);

    const review = await Review.create({
      order: order._id,
      user: req.user._id,
      vendor: order.vendor._id,
      rating,
      comment,
      itemReviews: normalizedItemRatings,
    });

    order.review = review._id;
    await order.save();

    const populatedReview = await Review.findById(review._id).populate("user", "name avatarUrl");

    await createNotification(req.io, {
      recipient: order.vendor.user,
      type: "review",
      title: "New customer review",
      message: `${req.user.name} left a ${rating}-star review for order #${order.orderNumber}.`,
      link: "/vendor/reports",
      metadata: {
        orderId: order._id,
        reviewId: review._id,
      },
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  initiateKhaltiOrder,
  verifyKhaltiPayment,
  getUserOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  createOrderReview,
};
