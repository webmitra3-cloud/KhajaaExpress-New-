const User = require("../models/User");

const getMyProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const { name, phone, address, avatarUrl, password } = req.body;

    user.name = name || user.name;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;
    user.avatarUrl = avatarUrl ?? user.avatarUrl;

    if (password) {
      user.password = password;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
