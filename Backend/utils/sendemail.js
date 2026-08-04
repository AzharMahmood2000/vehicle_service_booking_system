const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify SMTP connection before sending
  try {
    await transporter.verify();
  } catch (verifyError) {
    console.error("SMTP transporter verification failed:", {
      name: verifyError.name,
      code: verifyError.code,
      command: verifyError.command,
      message: verifyError.message,
    });
    throw verifyError;
  }

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
