import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const recipients = Array.isArray(to) ? to : [to];

    const emailData = {
      from: "RideShare <onboarding@resend.dev>", // MUST use this on free tier
      to: recipients,
      subject,
      html,
    };

    // Add attachments if provided
    if (attachments.length > 0) {
      emailData.attachments = attachments.map((file) => ({
        filename: file.filename,
        content: file.content,
      }));
    }

    const data = await resend.emails.send(emailData);
    console.log("✅ Email sent successfully:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Resend Error:", error);
    throw error;
  }
};