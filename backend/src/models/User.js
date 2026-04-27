const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    // Legacy field from an older auth schema. Kept for login migration.
    passwordHash: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  if (/^\$2[aby]\$\d{2}\$/.test(String(this.password || ""))) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  const storedPassword = this.password || this.passwordHash;

  if (!storedPassword) {
    return false;
  }

  try {
    return await bcrypt.compare(enteredPassword, storedPassword);
  } catch (error) {
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
