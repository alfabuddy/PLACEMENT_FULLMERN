import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT, // 465
  secure: true, // MUST be true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  await transporter.sendMail({
    from: `"RideShare" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
};
