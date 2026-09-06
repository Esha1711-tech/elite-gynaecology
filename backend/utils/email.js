const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Elite Gynaecology Lahore" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

const sendNotificationEmail = async (user, title, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #5A1748;">${title}</h2>
      <p style="color: #374151;">${message}</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
      <p style="color: #9CA3AF; font-size: 12px;">This is an automated message from Elite Gynaecology Lahore.</p>
    </div>
  `;
  return await sendEmail(user.email, title, html);
};

module.exports = { sendEmail, sendNotificationEmail };
