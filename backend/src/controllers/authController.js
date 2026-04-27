const bcrypt = require("bcryptjs");
const PendingRegistration = require("../models/PendingRegistration");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const { buildActivationToken, hashActivationToken } = require("../utils/activation");
const { sendMail } = require("../utils/emailService");
const generateToken = require("../utils/generateToken");
const { createNotification, createNotifications } = require("../utils/notificationService");
const { normalizeRole, normalizeRoleOrDefault } = require("../utils/role");
const { getWebsiteUrl } = require("../utils/url");

const sanitizeUser = (user, vendor = null) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  avatarUrl: user.avatarUrl,
  role: normalizeRoleOrDefault(user.role),
  vendorProfile: vendor
    ? {
        _id: vendor._id,
        restaurantName: vendor.restaurantName,
        approvalStatus: vendor.approvalStatus,
      }
    : null,
});

const buildActivationEmail = ({ name, activationUrl, role }) => {
  const accountLabel = role === "vendor" ? "vendor" : "customer";
  const subject = "Activate your KhajaExpress account";
  const text = [
    `Hello ${name},`,
    "",
    `Thanks for registering your ${accountLabel} account on KhajaExpress.`,
    "Click the activation link below to finish creating your account:",
    activationUrl,
    "",
    "This link expires in 24 hours.",
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>Hello ${name},</p>
      <p>Thanks for registering your ${accountLabel} account on KhajaExpress.</p>
      <p>Click the button below to finish creating your account:</p>
      <p>
        <a href="${activationUrl}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:999px;">
          Activate account
        </a>
      </p>
      <p>If the button does not work, copy this link into your browser:</p>
      <p><a href="${activationUrl}">${activationUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;

  return { subject, text, html };
};

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      accountType,
      restaurantName,
      description,
      logoUrl,
      coverImageUrl,
    } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const normalizedAccountType = normalizeRole(accountType);

    if (normalizedAccountType === "vendor" && (!restaurantName || !address || !phone)) {
      res.status(400);
      throw new Error("Vendor registration requires restaurant name, phone, and address");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(400);
      throw new Error("Email is already registered");
    }

    const role = normalizedAccountType === "vendor" ? "vendor" : "user";
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rawToken, tokenHash, expiresAt } = buildActivationToken();

    await PendingRegistration.findOneAndDelete({ email: normalizedEmail });

    const pendingRegistration = await PendingRegistration.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      role,
      restaurantName: restaurantName || "",
      description: description || "",
      logoUrl: logoUrl || "",
      coverImageUrl: coverImageUrl || "",
      activationTokenHash: tokenHash,
      activationExpiresAt: expiresAt,
    });

    const activationUrl = `${getWebsiteUrl()}/activate-account?token=${rawToken}`;
    const emailContent = buildActivationEmail({
      name: pendingRegistration.name,
      activationUrl,
      role,
    });

    try {
      await sendMail({
        to: pendingRegistration.email,
        ...emailContent,
      });
    } catch (error) {
      await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
      res.status(500);
      throw new Error(`Unable to send activation email. ${error.message}`);
    }

    res.status(201).json({
      message:
        role === "vendor"
          ? "Activation link sent to your email. Your vendor account will be created after activation and will still need admin approval."
          : "Activation link sent to your email. Click it before you can log in or create your profile.",
      activationRequired: true,
    });
  } catch (error) {
    next(error);
  }
};

const activateRegistration = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;

    if (!token) {
      res.status(400);
      throw new Error("Activation token is required");
    }

    const pendingRegistration = await PendingRegistration.findOne({
      activationTokenHash: hashActivationToken(token),
    });

    if (!pendingRegistration || pendingRegistration.activationExpiresAt < new Date()) {
      if (pendingRegistration?._id) {
        await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
      }

      res.status(400);
      throw new Error("Activation link is invalid or expired");
    }

    const existingUser = await User.findOne({ email: pendingRegistration.email });

    if (existingUser) {
      await PendingRegistration.deleteOne({ _id: pendingRegistration._id });

      res.json({
        message: "Account is already activated. Please log in.",
      });
      return;
    }

    const user = await User.create({
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      password: pendingRegistration.password,
      phone: pendingRegistration.phone,
      address: pendingRegistration.address,
      role: pendingRegistration.role,
    });

    let vendor = null;

    if (pendingRegistration.role === "vendor") {
      vendor = await Vendor.create({
        user: user._id,
        restaurantName: pendingRegistration.restaurantName,
        description: pendingRegistration.description,
        address: pendingRegistration.address,
        phone: pendingRegistration.phone,
        logoUrl: pendingRegistration.logoUrl,
        coverImageUrl: pendingRegistration.coverImageUrl,
      });
    }

    await PendingRegistration.deleteOne({ _id: pendingRegistration._id });

    await createNotification(req.io, {
      recipient: user._id,
      type: vendor ? "vendor" : "account",
      title: vendor ? "Vendor account activated" : "Account activated",
      message: vendor
        ? "Your vendor account is active and is now waiting for admin approval."
        : "Your account is active. You can now log in and complete your profile.",
      link: vendor ? "/vendor/login" : "/login",
    });

    if (vendor) {
      const adminIds = await User.find({ role: "admin" }).distinct("_id");

      await createNotifications(req.io, adminIds, {
        type: "vendor",
        title: "New vendor waiting for approval",
        message: `${vendor.restaurantName} completed email activation and is waiting for review.`,
        link: "/admin/approvals",
        metadata: {
          vendorId: vendor._id,
        },
      });
    }

    res.json({
      message: vendor
        ? "Email verified. Your vendor account was created and is now waiting for admin approval."
        : "Email verified. Your account is active and ready to log in.",
      role: normalizeRoleOrDefault(user.role),
      user: sanitizeUser(user, vendor),
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password +passwordHash");

    if (!user) {
      const pendingRegistration = await PendingRegistration.findOne({ email: normalizedEmail });

      if (pendingRegistration && pendingRegistration.activationExpiresAt >= new Date()) {
        res.status(403);
        throw new Error("Please activate your account from the email link before logging in");
      }

      res.status(401);
      throw new Error("Invalid credentials");
    }

    if (!(user.password || user.passwordHash)) {
      res.status(409);
      throw new Error("Account password is missing. Reset the password or recreate the account.");
    }

    if (!(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const normalizedRole = normalizeRoleOrDefault(user.role);

    if ((!user.password && user.passwordHash) || user.role !== normalizedRole) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            ...(user.password ? {} : { password: user.passwordHash }),
            ...(user.role !== normalizedRole ? { role: normalizedRole } : {}),
          },
        }
      );

      user.password = user.password || user.passwordHash;
      user.role = normalizedRole;
    }

    let vendor = null;

    if (normalizedRole === "vendor") {
      vendor = await Vendor.findOne({ user: user._id });

      if (!vendor) {
        res.status(403);
        throw new Error("Vendor profile not found");
      }

      if (vendor.approvalStatus === "pending") {
        res.status(403);
        throw new Error("Vendor account is pending admin approval");
      }

      if (vendor.approvalStatus === "rejected") {
        res.status(403);
        throw new Error("Vendor account was rejected by admin");
      }
    }

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: sanitizeUser(user, vendor),
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    let vendor = null;

    if (req.user.role === "vendor") {
      vendor = await Vendor.findOne({ user: req.user._id });
    }

    res.json({
      user: sanitizeUser(req.user, vendor),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  activateRegistration,
  login,
  getCurrentUser,
};
