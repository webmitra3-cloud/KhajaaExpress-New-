const StatusBadge = ({ value }) => {
  const normalized = String(value || "").toLowerCase();
  let className = "badge";

  if (normalized.includes("approved") || normalized.includes("delivered") || normalized.includes("paid") || normalized === "admin") {
    className += " badge-success";
  } else if (normalized.includes("pending") || normalized.includes("preparing") || normalized.includes("confirmed")) {
    className += " badge-warning";
  } else if (normalized.includes("rejected") || normalized.includes("cancelled") || normalized.includes("failed") || normalized.includes("refunded")) {
    className += " badge-danger";
  } else {
    className += " badge-neutral";
  }

  return <span className={className}>{value}</span>;
};

export default StatusBadge;
