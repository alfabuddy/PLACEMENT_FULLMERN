import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.resend.com
  port: process.env.EMAIL_PORT, // 465
  secure: true,                // Required for port 465
  auth: {
    user: process.env.EMAIL_USER, // 'resend'
    pass: process.env.EMAIL_PASS, // Your API key starting with re_
  },
});

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    await transporter.sendMail({
      // While in testing/onboarding mode, you MUST use this sender:
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
      attachments,
    });
    console.log("Email sent successfully via Resend");
  } catch (error) {
    console.error("Resend SMTP Error:", error);
    throw error;
  }
};