const Food = require("../models/Food");
const Category = require("../models/Category");
const Vendor = require("../models/Vendor");

const getPublicFoods = async (req, res, next) => {
  try {
    const { search = "", vendorId = "", categoryId = "" } = req.query;
    const approvedVendors = await Vendor.find({ approvalStatus: "approved" }).select("_id");
    const vendorIds = approvedVendors.map((vendor) => vendor._id);

    const filters = {
      vendor: { $in: vendorIds },
    };

    if (search) {
      filters.name = { $regex: search, $options: "i" };
    }

    if (vendorId) {
      const approvedVendorIds = vendorIds.map((id) => String(id));

      if (!approvedVendorIds.includes(String(vendorId))) {
        return res.json([]);
      }

      filters.vendor = vendorId;
    }

    if (categoryId) {
      filters.category = categoryId;
    }

    const foods = await Food.find(filters)
      .populate("category", "name")
      .populate({
        path: "vendor",
        select: "restaurantName user",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.json(foods);
  } catch (error) {
    next(error);
  }
};

const getVendorFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({ vendor: req.vendor._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(foods);
  } catch (error) {
    next(error);
  }
};

const createFood = async (req, res, next) => {
  try {
    const { name, category, price, description, imageUrl, isAvailable } = req.body;

    if (!name || !category || price === undefined) {
      res.status(400);
      throw new Error("Name, category, and price are required");
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      res.status(404);
      throw new Error("Category not found");
    }

    const food = await Food.create({
      vendor: req.vendor._id,
      category,
      name,
      description: description || "",
      imageUrl: imageUrl || "",
      price: Number(price),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    const populatedFood = await Food.findById(food._id).populate("category", "name");

    res.status(201).json({
      message: "Food item created successfully",
      food: populatedFood,
    });
  } catch (error) {
    next(error);
  }
};

const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!food) {
      res.status(404);
      throw new Error("Food item not found");
    }

    const { name, category, price, description, imageUrl, isAvailable } = req.body;

    if (category) {
      const existingCategory = await Category.findById(category);

      if (!existingCategory) {
        res.status(404);
        throw new Error("Category not found");
      }

      food.category = category;
    }

    food.name = name || food.name;
    food.price = price !== undefined ? Number(price) : food.price;
    food.description = description ?? food.description;
    food.imageUrl = imageUrl ?? food.imageUrl;
    food.isAvailable = isAvailable !== undefined ? Boolean(isAvailable) : food.isAvailable;

    await food.save();

    const populatedFood = await Food.findById(food._id).populate("category", "name");

    res.json({
      message: "Food item updated successfully",
      food: populatedFood,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!food) {
      res.status(404);
      throw new Error("Food item not found");
    }

    res.json({
      message: "Food item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicFoods,
  getVendorFoods,
  createFood,
  updateFood,
  deleteFood,
};

