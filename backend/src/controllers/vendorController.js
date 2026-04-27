const Food = require("../models/Food");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Vendor = require("../models/Vendor");
const { ORDER_STATUS } = require("../constants/orderStatus");

const REPORTABLE_ORDER_FILTER = {
  $or: [{ paymentMethod: "Cash on Delivery" }, { paymentMethod: "Dummy Online Payment" }, { paymentStatus: "Paid" }],
};

const buildVendorOrderMatch = (vendorId, extra = {}) => ({
  vendor: vendorId,
  ...REPORTABLE_ORDER_FILTER,
  ...extra,
});

const buildDateMatch = (query) => {
  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;

  if (from instanceof Date && !Number.isNaN(from.valueOf()) && to instanceof Date && !Number.isNaN(to.valueOf())) {
    return {
      createdAt: {
        $gte: from,
        $lte: new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1),
      },
    };
  }

  if (String(query.days || "30").toLowerCase() === "all") {
    return {};
  }

  const days = Math.max(1, Number(query.days || 30));
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return {
    createdAt: {
      $gte: startDate,
    },
  };
};

const getReviewSummaryForVendors = async (vendorIds) => {
  const summary = await Review.aggregate([
    {
      $match: {
        vendor: { $in: vendorIds },
      },
    },
    {
      $group: {
        _id: "$vendor",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    summary.map((item) => [
      String(item._id),
      {
        averageRating: Number(item.averageRating || 0),
        reviewCount: item.reviewCount || 0,
      },
    ])
  );
};

const getFoodCountMap = async (vendorIds) => {
  const counts = await Food.aggregate([
    {
      $match: {
        vendor: { $in: vendorIds },
      },
    },
    {
      $group: {
        _id: "$vendor",
        foodCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(counts.map((item) => [String(item._id), item.foodCount]));
};

const getDeliveredCountMap = async (vendorIds) => {
  const counts = await Order.aggregate([
    {
      $match: {
        vendor: { $in: vendorIds },
        status: ORDER_STATUS.DELIVERED,
        ...REPORTABLE_ORDER_FILTER,
      },
    },
    {
      $group: {
        _id: "$vendor",
        deliveredOrders: { $sum: 1 },
      },
    },
  ]);

  return new Map(counts.map((item) => [String(item._id), item.deliveredOrders]));
};

const getPublicVendors = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const filters = {
      approvalStatus: "approved",
    };

    if (search) {
      filters.$or = [
        { restaurantName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await Vendor.find(filters)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const vendorIds = vendors.map((vendor) => vendor._id);
    const [foodCountMap, reviewSummaryMap, deliveredCountMap] = await Promise.all([
      getFoodCountMap(vendorIds),
      getReviewSummaryForVendors(vendorIds),
      getDeliveredCountMap(vendorIds),
    ]);

    res.json(
      vendors.map((vendor) => {
        const reviewSummary = reviewSummaryMap.get(String(vendor._id)) || {
          averageRating: 0,
          reviewCount: 0,
        };

        return {
          ...vendor,
          foodCount: foodCountMap.get(String(vendor._id)) || 0,
          averageRating: reviewSummary.averageRating,
          reviewCount: reviewSummary.reviewCount,
          deliveredOrders: deliveredCountMap.get(String(vendor._id)) || 0,
        };
      })
    );
  } catch (error) {
    next(error);
  }
};

const getVendorDetails = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      _id: req.params.id,
      approvalStatus: "approved",
    }).populate("user", "name email");

    if (!vendor) {
      res.status(404);
      throw new Error("Restaurant not found");
    }

    const [foods, reviewSummary, foodRatings, reviews] = await Promise.all([
      Food.find({ vendor: vendor._id }).populate("category", "name").sort({ createdAt: -1 }),
      Review.aggregate([
        {
          $match: {
            vendor: vendor._id,
          },
        },
        {
          $group: {
            _id: "$vendor",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
      Review.aggregate([
        {
          $match: {
            vendor: vendor._id,
          },
        },
        { $unwind: "$itemReviews" },
        {
          $group: {
            _id: "$itemReviews.food",
            averageRating: { $avg: "$itemReviews.rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
      Review.find({ vendor: vendor._id }).populate("user", "name avatarUrl").sort({ createdAt: -1 }).limit(8),
    ]);

    const foodRatingMap = new Map(
      foodRatings.map((item) => [
        String(item._id),
        {
          averageRating: Number(item.averageRating || 0),
          reviewCount: item.reviewCount || 0,
        },
      ])
    );

    const foodsWithRatings = foods.map((food) => {
      const ratingStats = foodRatingMap.get(String(food._id)) || {
        averageRating: 0,
        reviewCount: 0,
      };

      return {
        ...food.toObject(),
        averageRating: ratingStats.averageRating,
        reviewCount: ratingStats.reviewCount,
      };
    });

    res.json({
      vendor: {
        ...vendor.toObject(),
        averageRating: Number(reviewSummary[0]?.averageRating || 0),
        reviewCount: reviewSummary[0]?.reviewCount || 0,
      },
      foods: foodsWithRatings,
      reviews,
      reviewSummary: {
        averageRating: Number(reviewSummary[0]?.averageRating || 0),
        reviewCount: reviewSummary[0]?.reviewCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate("user", "name email phone address avatarUrl role");

    if (!vendor) {
      res.status(404);
      throw new Error("Vendor profile not found");
    }

    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

const updateVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      res.status(404);
      throw new Error("Vendor profile not found");
    }

    const { restaurantName, description, address, phone, logoUrl, coverImageUrl } = req.body;

    vendor.restaurantName = restaurantName || vendor.restaurantName;
    vendor.description = description ?? vendor.description;
    vendor.address = address || vendor.address;
    vendor.phone = phone || vendor.phone;
    vendor.logoUrl = logoUrl ?? vendor.logoUrl;
    vendor.coverImageUrl = coverImageUrl ?? vendor.coverImageUrl;

    await vendor.save();

    res.json({
      message: "Vendor profile updated successfully",
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

const getVendorDashboard = async (req, res, next) => {
  try {
    const orderMatch = buildVendorOrderMatch(req.vendor._id);
    const [foodCount, totalOrders, pendingOrders, deliveredOrders, recentOrders, revenueData, reviewData] = await Promise.all([
      Food.countDocuments({ vendor: req.vendor._id }),
      Order.countDocuments(orderMatch),
      Order.countDocuments({
        ...orderMatch,
        status: { $in: [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.OUT_FOR_DELIVERY] },
      }),
      Order.countDocuments({
        ...orderMatch,
        status: ORDER_STATUS.DELIVERED,
      }),
      Order.find(orderMatch).populate("user", "name email").sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        {
          $match: {
            ...orderMatch,
            status: { $ne: ORDER_STATUS.CANCELLED },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ]),
      Review.aggregate([
        {
          $match: {
            vendor: req.vendor._id,
          },
        },
        {
          $group: {
            _id: "$vendor",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      stats: {
        foodCount,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        averageRating: Number(reviewData[0]?.averageRating || 0),
        reviewCount: reviewData[0]?.reviewCount || 0,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

const getVendorReport = async (req, res, next) => {
  try {
    const dateMatch = buildDateMatch(req.query);
    const orderMatch = buildVendorOrderMatch(req.vendor._id, dateMatch);
    const [summaryCounts, revenueData, statusBreakdown, paymentBreakdown, topFoods, reviewStats, recentReviews] = await Promise.all([
      Promise.all([
        Order.countDocuments(orderMatch),
        Order.countDocuments({ ...orderMatch, status: ORDER_STATUS.DELIVERED }),
        Order.countDocuments({ ...orderMatch, status: ORDER_STATUS.CANCELLED }),
      ]),
      Order.aggregate([
        {
          $match: {
            ...orderMatch,
            status: { $ne: ORDER_STATUS.CANCELLED },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            averageOrderValue: { $avg: "$totalPrice" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: orderMatch,
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        {
          $match: orderMatch,
        },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            totalSales: { $sum: "$totalPrice" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            ...orderMatch,
            status: { $ne: ORDER_STATUS.CANCELLED },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            totalQuantity: { $sum: "$items.quantity" },
            totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
      ]),
      Review.aggregate([
        {
          $match: {
            vendor: req.vendor._id,
            ...dateMatch,
          },
        },
        {
          $group: {
            _id: "$vendor",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
      Review.find({
        vendor: req.vendor._id,
        ...dateMatch,
      })
        .populate("user", "name avatarUrl")
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const [totalOrders, deliveredOrders, cancelledOrders] = summaryCounts;

    res.json({
      generatedAt: new Date(),
      filters: {
        days: req.query.days || "30",
        from: req.query.from || "",
        to: req.query.to || "",
      },
      summary: {
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        activeOrders: totalOrders - deliveredOrders - cancelledOrders,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        averageOrderValue: revenueData[0]?.averageOrderValue || 0,
        averageRating: Number(reviewStats[0]?.averageRating || 0),
        reviewCount: reviewStats[0]?.reviewCount || 0,
      },
      statusBreakdown,
      paymentBreakdown,
      topFoods,
      recentReviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicVendors,
  getVendorDetails,
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  getVendorReport,
};
