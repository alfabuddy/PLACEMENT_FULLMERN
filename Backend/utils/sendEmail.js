import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail', // Let Nodemailer handle the host, port, and security
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Ensure this is your 16-character App Password
  },
});

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    await transporter.sendMail({
      from: `"RideShare" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Nodemailer Error:", error);
    // This will now catch specific errors like 'Invalid Login' if your App Password is wrong
  }
};