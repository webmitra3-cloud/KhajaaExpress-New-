const Category = require("../models/Category");
const Food = require("../models/Food");
const Vendor = require("../models/Vendor");

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate("createdBy", "name role avatarUrl")
      .sort({ name: 1 })
      .lean();

    const categoryUsage = await Food.aggregate([
      {
        $group: {
          _id: "$category",
          foodCount: { $sum: 1 },
          vendorIds: { $addToSet: "$vendor" },
        },
      },
    ]);

    const creatorIds = categories.map((category) => category.createdBy?._id).filter(Boolean);
    const creatorVendors = await Vendor.find({ user: { $in: creatorIds } })
      .select("user restaurantName logoUrl coverImageUrl approvalStatus")
      .lean();

    const usageMap = new Map(
      categoryUsage.map((item) => [
        String(item._id),
        {
          foodCount: item.foodCount || 0,
          vendorCount: item.vendorIds?.length || 0,
        },
      ])
    );

    const vendorByUserId = new Map(creatorVendors.map((vendor) => [String(vendor.user), vendor]));

    res.json(
      categories.map((category) => ({
        ...category,
        foodCount: usageMap.get(String(category._id))?.foodCount || 0,
        vendorCount: usageMap.get(String(category._id))?.vendorCount || 0,
        createdByVendor: category.createdBy ? vendorByUserId.get(String(category.createdBy._id)) || null : null,
      }))
    );
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error("Category name is required");
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingCategory) {
      return res.json({
        message: "Category already exists",
        category: existingCategory,
      });
    }

    const category = await Category.create({
      name: name.trim(),
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
};
