import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp-relay.brevo.com
  port: Number(process.env.EMAIL_PORT), // 587
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.EMAIL_USER, // MUST be "apikey"
    pass: process.env.EMAIL_PASS, // Brevo SMTP key
  },
});

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    await transporter.sendMail({
      from: `"RideShare" <abhishek9852815692@gmail.com>`, // verified sender
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      attachments,
    });

    console.log("✅ Email successfully sent via Brevo SMTP");
  } catch (error) {
    console.error("❌ Brevo SMTP Error:", error);
    throw error;
  }
};
