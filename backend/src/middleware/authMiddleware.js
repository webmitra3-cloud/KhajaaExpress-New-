const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const { normalizeRole, normalizeRoleOrDefault } = require("../utils/role");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    user.role = normalizeRoleOrDefault(user.role);
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  const allowedRoles = roles.map((role) => normalizeRoleOrDefault(role));
  const currentRole = normalizeRole(req.user?.role);

  if (!currentRole || !allowedRoles.includes(currentRole)) {
    res.status(403);
    return next(new Error("Access denied"));
  }

  next();
};

const requireApprovedVendor = async (req, res, next) => {
  if (normalizeRole(req.user?.role) !== "vendor") {
    res.status(403);
    return next(new Error("Vendor access required"));
  }

  const vendor = await Vendor.findOne({ user: req.user._id });

  if (!vendor || vendor.approvalStatus !== "approved") {
    res.status(403);
    return next(new Error("Vendor account is not approved"));
  }

  req.vendor = vendor;
  next();
};

module.exports = {
  protect,
  authorize,
  requireApprovedVendor,
};
