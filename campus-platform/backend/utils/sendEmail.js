const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/**
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('Email send error:', err.message);
    // Non-fatal — don't throw
  }
};

module.exports = sendEmail;
