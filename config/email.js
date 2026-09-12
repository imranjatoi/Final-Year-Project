const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.sendVerificationApproval = async (to, name) => {
  await transporter.sendMail({
    from: `"Baghban Platform" <${process.env.EMAIL_USER}>`,
    to, subject: '🌿 Your Seller Account is Verified – Baghban',
    html: `<h2>Congratulations ${name}!</h2><p>Your seller account on Baghban has been verified. You can now list plants for sale.</p>`
  });
};

exports.sendVerificationRejection = async (to, name, reason) => {
  await transporter.sendMail({
    from: `"Baghban Platform" <${process.env.EMAIL_USER}>`,
    to, subject: '❌ Seller Verification Update – Baghban',
    html: `<h2>Hello ${name},</h2><p>Your seller application was not approved.</p><p><strong>Reason:</strong> ${reason}</p><p>You may re-apply with updated information.</p>`
  });
};

exports.sendOrderNotification = async (to, sellerName, orderId) => {
  await transporter.sendMail({
    from: `"Baghban Platform" <${process.env.EMAIL_USER}>`,
    to, subject: '🛒 New Order Received – Baghban',
    html: `<h2>Hello ${sellerName},</h2><p>You have received a new order (#${orderId}). Please login to confirm or reject it.</p>`
  });
};

exports.sendOrderStatus = async (to, buyerName, status, orderId) => {
  await transporter.sendMail({
    from: `"Baghban Platform" <${process.env.EMAIL_USER}>`,
    to, subject: `Order Update: ${status} – Baghban`,
    html: `<h2>Hello ${buyerName},</h2><p>Your order (#${orderId}) status has been updated to: <strong>${status}</strong>.</p>`
  });
};

exports.sendWateringReminder = async (to, buyerName, plants) => {
  const list = plants.map(p => `<li>${p.plantName}</li>`).join('');
  await transporter.sendMail({
    from: `"Baghban Platform" <${process.env.EMAIL_USER}>`,
    to, subject: '💧 Plant Watering Reminder – Baghban',
    html: `<h2>Hello ${buyerName},</h2><p>The following plants need watering today:</p><ul>${list}</ul>`
  });
};
