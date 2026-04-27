const Food = require("../models/Food");
const HomeSlide = require("../models/HomeSlide");
const Order = require("../models/Order");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const { ORDER_STATUS } = require("../constants/orderStatus");
const { createNotification } = require("../utils/notificationService");

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalVendors, totalPendingVendors, totalFoodPosted, recentOrders, recentPendingVendors, foodOrdered] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        Vendor.countDocuments(),
        Vendor.countDocuments({ approvalStatus: "pending" }),
        Food.countDocuments(),
        Order.find()
          .populate("user", "name")
          .populate("vendor", "restaurantName")
          .sort({ createdAt: -1 })
          .limit(5),
        Vendor.find({ approvalStatus: "pending" })
          .populate("user", "name email")
          .sort({ createdAt: -1 })
          .limit(5),
        Order.aggregate([
          { $unwind: "$items" },
          {
            $group: {
              _id: null,
              totalFoodOrdered: { $sum: "$items.quantity" },
            },
          },
        ]),
      ]);

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalPendingVendors,
        totalFoodOrdered: foodOrdered[0]?.totalFoodOrdered || 0,
        totalFoodPosted,
        totalRestaurants: totalVendors,
      },
      recentOrders,
      recentPendingVendors,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    const vendors = await Vendor.find().select("user approvalStatus restaurantName").lean();
    const vendorMap = new Map(vendors.map((vendor) => [String(vendor.user), vendor]));

    const usersWithVendorData = users.map((user) => ({
      ...user,
      vendorInfo: vendorMap.get(String(user._id)) || null,
    }));

    res.json(usersWithVendorData);
  } catch (error) {
    next(error);
  }
};

const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find()
      .populate("user", "name email phone address role")
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

const getPendingVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ approvalStatus: "pending" })
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

const approveVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate("user", "name email");

    if (!vendor) {
      res.status(404);
      throw new Error("Vendor not found");
    }

    vendor.approvalStatus = "approved";
    vendor.approvedAt = new Date();
    vendor.rejectedReason = "";
    await vendor.save();

    await createNotification(req.io, {
      recipient: vendor.user._id,
      type: "vendor",
      title: "Vendor account approved",
      message: `${vendor.restaurantName} is approved. You can now log in and manage your restaurant.`,
      link: "/vendor/login",
      metadata: {
        vendorId: vendor._id,
      },
    });

    res.json({
      message: "Vendor approved successfully",
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

const rejectVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate("user", "name email");

    if (!vendor) {
      res.status(404);
      throw new Error("Vendor not found");
    }

    vendor.approvalStatus = "rejected";
    vendor.rejectedReason = req.body.reason || "Rejected by admin";
    await vendor.save();

    await createNotification(req.io, {
      recipient: vendor.user._id,
      type: "vendor",
      title: "Vendor account rejected",
      message: `Your vendor application was rejected. ${vendor.rejectedReason}`,
      link: "/vendor/login",
      metadata: {
        vendorId: vendor._id,
      },
    });

    res.json({
      message: "Vendor rejected successfully",
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

const getAllFoods = async (req, res, next) => {
  try {
    const foods = await Food.find()
      .populate("category", "name")
      .populate({
        path: "vendor",
        select: "restaurantName user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.json(foods);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("vendor", "restaurantName phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const [statusBreakdown, paymentBreakdown, salesByVendorRaw, topFoods, totalOrders, deliveredOrders, cancelledOrders] =
      await Promise.all([
        Order.aggregate([
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
            $group: {
              _id: "$paymentMethod",
              count: { $sum: 1 },
            },
          },
        ]),
        Order.aggregate([
          {
            $match: {
              status: { $ne: ORDER_STATUS.CANCELLED },
            },
          },
          {
            $group: {
              _id: "$vendor",
              totalSales: { $sum: "$totalPrice" },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { totalSales: -1 } },
        ]),
        Order.aggregate([
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.name",
              totalQuantity: { $sum: "$items.quantity" },
            },
          },
          { $sort: { totalQuantity: -1 } },
          { $limit: 5 },
        ]),
        Order.countDocuments(),
        Order.countDocuments({ status: ORDER_STATUS.DELIVERED }),
        Order.countDocuments({ status: ORDER_STATUS.CANCELLED }),
      ]);

    const vendorIds = salesByVendorRaw.map((item) => item._id);
    const vendors = await Vendor.find({ _id: { $in: vendorIds } }).select("restaurantName");
    const vendorMap = new Map(vendors.map((vendor) => [String(vendor._id), vendor.restaurantName]));

    const salesByVendor = salesByVendorRaw.map((item) => ({
      vendorId: item._id,
      restaurantName: vendorMap.get(String(item._id)) || "Unknown Vendor",
      totalSales: item.totalSales,
      orderCount: item.orderCount,
    }));

    res.json({
      summary: {
        totalOrders,
        deliveredOrders,
        cancelledOrders,
      },
      statusBreakdown,
      paymentBreakdown,
      salesByVendor,
      topFoods,
    });
  } catch (error) {
    next(error);
  }
};

const getHomeSlides = async (req, res, next) => {
  try {
    const slides = await HomeSlide.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(slides);
  } catch (error) {
    next(error);
  }
};

const createHomeSlide = async (req, res, next) => {
  try {
    const { badge, title, subtitle, imageUrl, ctaText, ctaLink, sortOrder, isActive } = req.body;

    if (!title || !imageUrl) {
      res.status(400);
      throw new Error("Title and image URL are required");
    }

    const slide = await HomeSlide.create({
      badge: badge || "KhajaExpress Picks",
      title,
      subtitle: subtitle || "",
      imageUrl,
      ctaText: ctaText || "Explore Restaurants",
      ctaLink: ctaLink || "/restaurants",
      sortOrder: Number(sortOrder || 0),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      message: "Homepage slide created successfully",
      slide,
    });
  } catch (error) {
    next(error);
  }
};

const updateHomeSlide = async (req, res, next) => {
  try {
    const slide = await HomeSlide.findById(req.params.id);

    if (!slide) {
      res.status(404);
      throw new Error("Homepage slide not found");
    }

    const { badge, title, subtitle, imageUrl, ctaText, ctaLink, sortOrder, isActive } = req.body;

    slide.badge = badge ?? slide.badge;
    slide.title = title || slide.title;
    slide.subtitle = subtitle ?? slide.subtitle;
    slide.imageUrl = imageUrl || slide.imageUrl;
    slide.ctaText = ctaText ?? slide.ctaText;
    slide.ctaLink = ctaLink ?? slide.ctaLink;
    slide.sortOrder = sortOrder !== undefined ? Number(sortOrder) : slide.sortOrder;
    slide.isActive = isActive !== undefined ? Boolean(isActive) : slide.isActive;

    await slide.save();

    res.json({
      message: "Homepage slide updated successfully",
      slide,
    });
  } catch (error) {
    next(error);
  }
};

const deleteHomeSlide = async (req, res, next) => {
  try {
    const slide = await HomeSlide.findByIdAndDelete(req.params.id);

    if (!slide) {
      res.status(404);
      throw new Error("Homepage slide not found");
    }

    res.json({
      message: "Homepage slide deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllVendors,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getAllFoods,
  getAllOrders,
  getReports,
  getHomeSlides,
  createHomeSlide,
  updateHomeSlide,
  deleteHomeSlide,
};
