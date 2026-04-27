export const formatCurrency = (value) => `NPR ${Number(value || 0).toFixed(2)}`;

export const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const getOrderItemCount = (items = []) =>
  items.reduce((total, item) => total + Number(item.quantity || 0), 0);

export const formatRating = (value) => Number(value || 0).toFixed(1);
