const Food = require("../models/Food");
const HomeSlide = require("../models/HomeSlide");
const Order = require("../models/Order");
const Vendor = require("../models/Vendor");

const getHomePageData = async (req, res, next) => {
  try {
    const slides = await HomeSlide.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();

    const approvedVendors = await Vendor.find({ approvalStatus: "approved" })
      .populate("user", "name email avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    const vendorIds = approvedVendors.map((vendor) => vendor._id);

    const [foodCountData, latestFoods, bestMenuData] = await Promise.all([
      Food.aggregate([
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
      ]),
      Food.find({
        vendor: { $in: vendorIds },
        isAvailable: true,
      })
        .populate("category", "name")
        .populate({
          path: "vendor",
          select: "restaurantName logoUrl coverImageUrl user",
          populate: {
            path: "user",
            select: "name avatarUrl",
          },
        })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.food",
            totalOrdered: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalOrdered: -1 } },
        { $limit: 6 },
      ]),
    ]);

    const foodCountMap = new Map(foodCountData.map((item) => [String(item._id), item.foodCount]));

    const featuredRestaurants = approvedVendors.slice(0, 6).map((vendor) => ({
      ...vendor,
      foodCount: foodCountMap.get(String(vendor._id)) || 0,
    }));

    let bestMenus = [];

    if (bestMenuData.length) {
      const bestFoodIds = bestMenuData.map((item) => item._id);
      const bestFoodDocs = await Food.find({
        _id: { $in: bestFoodIds },
        vendor: { $in: vendorIds },
      })
        .populate("category", "name")
        .populate({
          path: "vendor",
          select: "restaurantName logoUrl coverImageUrl user",
          populate: {
            path: "user",
            select: "name avatarUrl",
          },
        })
        .lean();

      const bestFoodMap = new Map(bestFoodDocs.map((food) => [String(food._id), food]));
      bestMenus = bestMenuData
        .map((item) => {
          const food = bestFoodMap.get(String(item._id));

          if (!food) {
            return null;
          }

          return {
            ...food,
            totalOrdered: item.totalOrdered,
          };
        })
        .filter(Boolean);
    }

    if (!bestMenus.length) {
      bestMenus = latestFoods.map((food, index) => ({
        ...food,
        totalOrdered: 6 - index,
      }));
    }

    res.json({
      slides,
      stats: {
        restaurantCount: approvedVendors.length,
        latestFoodCount: latestFoods.length,
        bestMenuCount: bestMenus.length,
      },
      featuredRestaurants,
      latestFoods,
      bestMenus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomePageData,
};
