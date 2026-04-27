const { ORDER_STATUS, ORDER_STATUS_FLOW } = require("../constants/orderStatus");

const buildOrderNumber = () => {
  const shortTime = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `ORD-${shortTime}-${randomPart}`;
};

const canTransitionStatus = (currentStatus, nextStatus) => {
  if (currentStatus === ORDER_STATUS.CANCELLED || currentStatus === ORDER_STATUS.DELIVERED) {
    return false;
  }

  if (nextStatus === ORDER_STATUS.CANCELLED) {
    return true;
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  const nextIndex = ORDER_STATUS_FLOW.indexOf(nextStatus);

  return nextIndex === currentIndex + 1;
};

module.exports = {
  buildOrderNumber,
  canTransitionStatus,
};
