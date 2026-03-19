import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }) {
  try {
    // ✅ Create transporter AFTER env is loaded
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.GOOGLE_USER,
      to,
      subject,
      text,
      html,
    });

    console.log("📧 Email sent:", info.response);
    return "Email sent successfully";

  } catch (err) {
    console.error("❌ Email failed:", err.message);
    throw err;
  }
}