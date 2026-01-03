import axios from "axios";

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "RideShare",
          email: "abhishek9852815692@gmail.com", // MUST be verified in Brevo
        },
        to: Array.isArray(to)
          ? to.map((email) => ({ email }))
          : [{ email: to }],
        subject,
        htmlContent: html,
        attachment: attachments.map((file) => ({
          content: file.content.toString("base64"),
          name: file.filename,
        })),
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent via Brevo API");
  } catch (error) {
    console.error(
      "❌ Brevo API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
