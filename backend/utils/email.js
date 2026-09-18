const nodemailer = require("nodemailer");

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
    console.error("Email error:", error);
    return false;
  }
};

const sendPasswordResetEmail = async (
  user,
  resetUrl
) => {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      color: #374151;
    ">
      <h2 style="color:#CF3650;">
        Reset Your Password
      </h2>

      <p>Hello ${user.name},</p>

      <p>
        We received a request to reset the password
        for your Elite Gynaecology account.
      </p>

      <p style="margin:30px 0;">
        <a
          href="${resetUrl}"
          style="
            background:#CF3650;
            color:#ffffff;
            padding:12px 22px;
            text-decoration:none;
            border-radius:6px;
            display:inline-block;
          "
        >
          Reset Password
        </a>
      </p>

      <p>
        This link will expire in
        <strong>15 minutes</strong>.
      </p>

      <p>
        If you did not request a password reset,
        you can safely ignore this email.
      </p>

      <p style="font-size:12px;color:#6B7280;">
        For security, never share this reset link
        with anyone.
      </p>

      <hr style="
        border:none;
        border-top:1px solid #E5E7EB;
        margin:24px 0;
      ">

      <p style="font-size:12px;color:#9CA3AF;">
        Elite Gynaecology Lahore
      </p>
    </div>
  `;

  return sendEmail(
    user.email,
    "Reset Your Elite Gynaecology Password",
    html
  );
};

const sendNotificationEmail = async (
  user,
  title,
  message
) => {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
    ">
      <h2 style="color:#CF3650;">
        ${title}
      </h2>

      <p style="color:#374151;">
        ${message}
      </p>

      <hr style="
        border:none;
        border-top:1px solid #E5E7EB;
        margin:20px 0;
      ">

      <p style="
        color:#9CA3AF;
        font-size:12px;
      ">
        This is an automated message from
        Elite Gynaecology Lahore.
      </p>
    </div>
  `;

  return sendEmail(
    user.email,
    title,
    html
  );
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
};