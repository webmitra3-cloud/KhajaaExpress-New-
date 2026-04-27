const VALID_ROLES = ["user", "vendor", "admin"];

const normalizeRole = (role) => {
  const normalized = String(role || "").trim().toLowerCase();
  return VALID_ROLES.includes(normalized) ? normalized : "";
};

const normalizeRoleOrDefault = (role, fallback = "user") => normalizeRole(role) || fallback;

module.exports = {
  VALID_ROLES,
  normalizeRole,
  normalizeRoleOrDefault,
};
