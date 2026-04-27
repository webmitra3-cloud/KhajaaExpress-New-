const buildBaseUrl = () => String(process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2/epayment").replace(/\/+$/, "");

const shouldLogKhalti = () => String(process.env.KHALTI_DEBUG_LOGS || "true").toLowerCase() !== "false";

const normalizeEndpoint = (path) => String(path || "").replace(/^\/+/, "");

const logKhaltiAttempt = (url, endpoint, body, attempt = 1) => {
  if (!shouldLogKhalti()) {
    return;
  }

  console.log(`Khalti API attempt ${attempt}: ${url}`, {
    endpoint,
    data: body,
  });
};

const logKhaltiSuccess = (url, endpoint, payload, attempt = 1) => {
  if (!shouldLogKhalti()) {
    return;
  }

  console.log(`Khalti API success ${attempt}: ${url}`, {
    endpoint,
    data: payload,
  });
};

const logKhaltiFailure = (url, endpoint, status, payload, attempt = 1) => {
  if (!shouldLogKhalti()) {
    return;
  }

  console.error(`Khalti API failed ${attempt}: ${url}`, {
    endpoint,
    status,
    data: payload,
  });
};

const extractErrorMessage = (payload) => {
  if (!payload) {
    return "Khalti request failed";
  }

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  if (Array.isArray(payload.detail)) {
    return payload.detail.join(", ");
  }

  return "Khalti request failed";
};

const callKhalti = async (path, body) => {
  if (!process.env.KHALTI_SECRET_KEY) {
    throw new Error("Khalti is not configured");
  }

  const endpoint = normalizeEndpoint(path);
  const url = `${buildBaseUrl()}${path}`;
  const attempt = 1;

  logKhaltiAttempt(url, endpoint, body, attempt);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    logKhaltiFailure(url, endpoint, response.status, payload, attempt);
    throw new Error(extractErrorMessage(payload));
  }

  logKhaltiSuccess(url, endpoint, payload, attempt);
  return payload;
};

const initiateKhaltiPayment = async ({
  amount,
  purchaseOrderId,
  purchaseOrderName,
  returnUrl,
  websiteUrl,
  customerInfo,
}) =>
  callKhalti("/initiate/", {
    return_url: returnUrl,
    website_url: websiteUrl,
    amount,
    purchase_order_id: purchaseOrderId,
    purchase_order_name: purchaseOrderName,
    customer_info: customerInfo,
  });

const lookupKhaltiPayment = async (pidx) =>
  callKhalti("/lookup/", {
    pidx,
  });

module.exports = {
  initiateKhaltiPayment,
  lookupKhaltiPayment,
};
