const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getWebsiteUrl = () => trimTrailingSlash(process.env.WEBSITE_URL || process.env.CLIENT_URL || "http://localhost:5173");

module.exports = {
  getWebsiteUrl,
};
