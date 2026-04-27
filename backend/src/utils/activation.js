const crypto = require("crypto");

const ACTIVATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

const buildActivationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  return {
    rawToken,
    tokenHash,
    expiresAt: new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS),
  };
};

const hashActivationToken = (token) => crypto.createHash("sha256").update(String(token || "")).digest("hex");

module.exports = {
  ACTIVATION_TOKEN_TTL_MS,
  buildActivationToken,
  hashActivationToken,
};
