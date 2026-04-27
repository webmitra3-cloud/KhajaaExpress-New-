export const getDefaultRoute = (role) => {
  if (role === "vendor") {
    return "/vendor";
  }

  if (role === "admin") {
    return "/admin";
  }

  return "/restaurants";
};

export const getRoleLoginRoute = (role) => {
  if (role === "vendor") {
    return "/vendor/login";
  }

  if (role === "admin") {
    return "/admin/login";
  }

  return "/login";
};

export const getNotificationRoute = (role) => {
  if (role === "vendor") {
    return "/vendor/notifications";
  }

  if (role === "admin") {
    return "/admin/notifications";
  }

  return "/user/notifications";
};

export const buildConversationKey = (userId, vendorUserId) => `${userId}:${vendorUserId}`;

export const ORDER_STATUSES = [
  "Order placed",
  "Order confirmed",
  "Preparing",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

export const getNextStatuses = (currentStatus) => {
  if (currentStatus === "Order placed") {
    return ["Order confirmed", "Cancelled"];
  }

  if (currentStatus === "Order confirmed") {
    return ["Preparing", "Cancelled"];
  }

  if (currentStatus === "Preparing") {
    return ["Out for delivery", "Cancelled"];
  }

  if (currentStatus === "Out for delivery") {
    return ["Delivered", "Cancelled"];
  }

  return [];
};
