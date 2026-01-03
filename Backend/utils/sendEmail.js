import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use the 'service' shorthand for better reliability
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This MUST be a 16-character Google App Password
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
