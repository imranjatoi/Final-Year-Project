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

exports.sendPasswordResetEmail = async (to, name, resetUrl) => {
  console.log('\n========================================');
  console.log('🔑 [PASSWORD RESET LINK]:', resetUrl);
  console.log('📧 Target Email:', to);
  console.log('========================================\n');
  try {
    await transporter.sendMail({
      from: `"Baghban Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: '🔒 Reset Your Password – Baghban',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #E0E0E0; border-radius: 12px; background: #FAFFF9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2E7D32; margin: 0; font-family: 'Georgia', serif;">🌿 Baghban</h1>
            <p style="color: #777; font-size: 14px; margin-top: 4px;">Smart Plant Marketplace</p>
          </div>
          <div style="background: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #ECEFF1;">
            <h3 style="color: #1B5E20; margin-top: 0;">Hello ${name || 'User'},</h3>
            <p style="color: #444; line-height: 1.6;">You requested a password reset for your Baghban account. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2E7D32; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(46,125,50,0.2);">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 13px;">⚠️ This link will expire in <strong>1 hour</strong>.</p>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">If you did not request this, you can safely ignore this email.</p>
          </div>
          <p style="text-align: center; color: #aaa; font-size: 11px; margin-top: 20px;">&copy; Baghban Plant Platform. All rights reserved.</p>
        </div>
      `
    });
  } catch (err) {
    console.log('ℹ️ Note: Email sending skipped (active in local test mode):', err.message);
  }
};
