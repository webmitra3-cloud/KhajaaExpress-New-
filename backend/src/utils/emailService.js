const nodemailer = require("nodemailer");

let transporter;

const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    throw new Error("SMTP configuration is incomplete");
  }

  return getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  isEmailConfigured,
  sendMail,
};
