import axios from "axios";

// helper function (filters bad emails)
const formatEmails = (to) => {
  const emails = Array.isArray(to) ? to : [to];

  return emails
    .filter(
      (email) =>
        typeof email === "string" &&
        email.includes("@") &&
        email.includes(".")
    )
    .map((email) => ({ email }));
};

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const formattedTo = formatEmails(to);

    // safety check
    if (formattedTo.length === 0) {
      console.log("❌ No valid email found, email not sent");
      return;
    }

    const emailPayload = {
      sender: {
        name: "RideShare",
        email: "abhishek9852815692@gmail.com", // verified in Brevo
      },
      to: formattedTo,
      subject,
      htmlContent: html,
    };

    // Only add attachments if there are any
    if (attachments.length > 0) {
      emailPayload.attachments = attachments.map((file) => ({
        content: file.content.toString("base64"),
        name: file.filename,
      }));
    }

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      emailPayload,
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error(
      "❌ Brevo API Error:",
      error.response?.data || error.message
    );
  }
};