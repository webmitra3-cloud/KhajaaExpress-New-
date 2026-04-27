require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Category = require("../models/Category");
const Food = require("../models/Food");
const Order = require("../models/Order");
const Message = require("../models/Message");
const HomeSlide = require("../models/HomeSlide");
const { ORDER_STATUS } = require("../constants/orderStatus");
const { buildConversationKey } = require("../utils/conversation");
const { buildOrderNumber } = require("../utils/orderHelpers");

const seed = async () => {
  await connectDB();

  await Promise.all([
    Message.deleteMany(),
    Order.deleteMany(),
    Food.deleteMany(),
    Category.deleteMany(),
    Vendor.deleteMany(),
    User.deleteMany(),
    HomeSlide.deleteMany(),
  ]);

  await User.create({
    name: "Project Admin",
    email: "admin@example.com",
    password: "admin123",
    phone: "9800000001",
    address: "KhajaExpress Admin Desk",
    role: "admin",
  });

  const userOne = await User.create({
    name: "Aarav User",
    email: "user1@example.com",
    password: "user123",
    phone: "9800000002",
    address: "Kathmandu Hostel",
    role: "user",
  });

  const userTwo = await User.create({
    name: "Nisha User",
    email: "user2@example.com",
    password: "user123",
    phone: "9800000003",
    address: "Lalitpur Apartment",
    role: "user",
  });

  const vendorUserOne = await User.create({
    name: "Fresh Bites Owner",
    email: "vendor1@example.com",
    password: "vendor123",
    phone: "9800000004",
    address: "New Road, Kathmandu",
    role: "vendor",
  });

  const vendorUserTwo = await User.create({
    name: "Campus Cafe Owner",
    email: "vendor2@example.com",
    password: "vendor123",
    phone: "9800000005",
    address: "Putalisadak, Kathmandu",
    role: "vendor",
  });

  const vendorUserThree = await User.create({
    name: "Sunrise Kitchen Owner",
    email: "vendor4@example.com",
    password: "vendor123",
    phone: "9800000007",
    address: "Maitighar, Kathmandu",
    role: "vendor",
  });

  const pendingVendorUser = await User.create({
    name: "Pending Vendor Owner",
    email: "vendor3@example.com",
    password: "vendor123",
    phone: "9800000006",
    address: "Baneshwor, Kathmandu",
    role: "vendor",
  });

  const approvedVendorOne = await Vendor.create({
    user: vendorUserOne._id,
    restaurantName: "Fresh Bites",
    description: "Simple home-style meals and fast lunch boxes.",
    address: "New Road, Kathmandu",
    phone: "9800001001",
    approvalStatus: "approved",
    approvedAt: new Date(),
    logoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    coverImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  });

  const approvedVendorTwo = await Vendor.create({
    user: vendorUserTwo._id,
    restaurantName: "Campus Cafe",
    description: "Affordable snacks, burgers, and coffee for students.",
    address: "Putalisadak, Kathmandu",
    phone: "9800001002",
    approvalStatus: "approved",
    approvedAt: new Date(),
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    coverImageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
  });

  const approvedVendorThree = await Vendor.create({
    user: vendorUserThree._id,
    restaurantName: "Sunrise Kitchen",
    description: "Early breakfast, wraps, and daily student combo meals.",
    address: "Maitighar, Kathmandu",
    phone: "9800001004",
    approvalStatus: "approved",
    approvedAt: new Date(),
    logoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    coverImageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9",
  });

  await Vendor.create({
    user: pendingVendorUser._id,
    restaurantName: "Pending Kitchen",
    description: "Waiting for admin approval.",
    address: "Baneshwor, Kathmandu",
    phone: "9800001003",
    approvalStatus: "pending",
  });

  const categories = await Category.insertMany([
    { name: "Momo", createdBy: vendorUserOne._id },
    { name: "Burger", createdBy: vendorUserTwo._id },
    { name: "Beverage", createdBy: vendorUserTwo._id },
    { name: "Rice Bowl", createdBy: vendorUserOne._id },
    { name: "Wrap", createdBy: vendorUserThree._id },
    { name: "Breakfast Combo", createdBy: vendorUserThree._id },
  ]);

  const categoryMap = Object.fromEntries(categories.map((category) => [category.name, category]));

  const foods = await Food.insertMany([
    {
      vendor: approvedVendorOne._id,
      category: categoryMap["Momo"]._id,
      name: "Chicken Momo",
      description: "10 pieces served with spicy tomato achar.",
      imageUrl: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f",
      price: 180,
      isAvailable: true,
    },
    {
      vendor: approvedVendorOne._id,
      category: categoryMap["Rice Bowl"]._id,
      name: "Veg Rice Bowl",
      description: "Rice with seasonal vegetables and pickle.",
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19",
      price: 220,
      isAvailable: true,
    },
    {
      vendor: approvedVendorTwo._id,
      category: categoryMap["Burger"]._id,
      name: "Chicken Burger",
      description: "Student-friendly burger with fries.",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
      price: 250,
      isAvailable: true,
    },
    {
      vendor: approvedVendorTwo._id,
      category: categoryMap["Beverage"]._id,
      name: "Cold Coffee",
      description: "Iced coffee with light cream topping.",
      imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c",
      price: 120,
      isAvailable: true,
    },
    {
      vendor: approvedVendorThree._id,
      category: categoryMap["Wrap"]._id,
      name: "Paneer Wrap",
      description: "Soft tortilla wrap with paneer, lettuce, and house sauce.",
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb",
      price: 210,
      isAvailable: true,
    },
    {
      vendor: approvedVendorThree._id,
      category: categoryMap["Breakfast Combo"]._id,
      name: "Breakfast Combo Set",
      description: "Toast, eggs, hash brown, and tea for a quick start.",
      imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
      price: 260,
      isAvailable: true,
    },
  ]);

  await HomeSlide.insertMany([
    {
      badge: "Today on KhajaExpress",
      title: "Hot campus favourites delivered fast",
      subtitle: "Browse approved local restaurants, compare menus, and place quick food orders in one simple app.",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      ctaText: "Explore Restaurants",
      ctaLink: "/restaurants",
      sortOrder: 1,
      isActive: true,
    },
    {
      badge: "Latest Picks",
      title: "Fresh breakfasts, wraps, momo, and burgers",
      subtitle: "Highlight your newest menu items right on the homepage using the admin panel carousel manager.",
      imageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9",
      ctaText: "See Best Menu",
      ctaLink: "/restaurants",
      sortOrder: 2,
      isActive: true,
    },
    {
      badge: "Vendor Spotlight",
      title: "Showcase restaurant banners from admin",
      subtitle: "Admins can add, edit, reorder, and disable homepage hero slides without touching the code.",
      imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
      ctaText: "Open Dashboard",
      ctaLink: "/admin",
      sortOrder: 3,
      isActive: true,
    },
  ]);

  await Order.create({
    orderNumber: buildOrderNumber(),
    user: userOne._id,
    vendor: approvedVendorOne._id,
    items: [
      {
        food: foods[0]._id,
        name: foods[0].name,
        price: foods[0].price,
        quantity: 2,
        imageUrl: foods[0].imageUrl,
      },
      {
        food: foods[1]._id,
        name: foods[1].name,
        price: foods[1].price,
        quantity: 1,
        imageUrl: foods[1].imageUrl,
      },
    ],
    totalPrice: foods[0].price * 2 + foods[1].price,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    deliveryAddress: userOne.address,
    status: ORDER_STATUS.PREPARING,
    statusHistory: [
      { status: ORDER_STATUS.PLACED },
      { status: ORDER_STATUS.CONFIRMED },
      { status: ORDER_STATUS.PREPARING },
    ],
  });

  await Order.create({
    orderNumber: buildOrderNumber(),
    user: userTwo._id,
    vendor: approvedVendorTwo._id,
    items: [
      {
        food: foods[2]._id,
        name: foods[2].name,
        price: foods[2].price,
        quantity: 1,
        imageUrl: foods[2].imageUrl,
      },
      {
        food: foods[3]._id,
        name: foods[3].name,
        price: foods[3].price,
        quantity: 2,
        imageUrl: foods[3].imageUrl,
      },
    ],
    totalPrice: foods[2].price + foods[3].price * 2,
    paymentMethod: "Dummy Online Payment",
    paymentStatus: "Paid",
    deliveryAddress: userTwo.address,
    status: ORDER_STATUS.OUT_FOR_DELIVERY,
    statusHistory: [
      { status: ORDER_STATUS.PLACED },
      { status: ORDER_STATUS.CONFIRMED },
      { status: ORDER_STATUS.PREPARING },
      { status: ORDER_STATUS.OUT_FOR_DELIVERY },
    ],
  });

  await Order.create({
    orderNumber: buildOrderNumber(),
    user: userOne._id,
    vendor: approvedVendorThree._id,
    items: [
      {
        food: foods[4]._id,
        name: foods[4].name,
        price: foods[4].price,
        quantity: 2,
        imageUrl: foods[4].imageUrl,
      },
      {
        food: foods[5]._id,
        name: foods[5].name,
        price: foods[5].price,
        quantity: 1,
        imageUrl: foods[5].imageUrl,
      },
    ],
    totalPrice: foods[4].price * 2 + foods[5].price,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    deliveryAddress: userOne.address,
    status: ORDER_STATUS.CONFIRMED,
    statusHistory: [
      { status: ORDER_STATUS.PLACED },
      { status: ORDER_STATUS.CONFIRMED },
    ],
  });

  const conversationKey = buildConversationKey(userOne._id, vendorUserOne._id);

  await Message.insertMany([
    {
      conversationKey,
      user: userOne._id,
      vendor: approvedVendorOne._id,
      sender: userOne._id,
      receiver: vendorUserOne._id,
      senderRole: "user",
      text: "Hello, please make my momo a little less spicy if possible.",
    },
    {
      conversationKey,
      user: userOne._id,
      vendor: approvedVendorOne._id,
      sender: vendorUserOne._id,
      receiver: userOne._id,
      senderRole: "vendor",
      text: "Sure, we noted it on your order.",
    },
  ]);

  console.log("Seed completed successfully");
  console.log("Admin login: admin@example.com / admin123");
  console.log("User login: user1@example.com / user123");
  console.log("Approved vendor login: vendor1@example.com / vendor123");
  console.log("Pending vendor login should fail: vendor3@example.com / vendor123");

  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
