import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    await transporter.sendMail({
      // IMPORTANT: This MUST match the sender email you verified in Step 1
      from: `"RideShare" abhishek9852815692@gmail.com`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      attachments,
    });
    console.log("Email successfully sent via Brevo!");
  } catch (error) {
    console.error("Brevo SMTP Error:", error);
    throw error;
  }
};