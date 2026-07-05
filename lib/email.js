import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "noreply@resend.dev";

export async function sendVerificationEmail(email, name, token) {
  if (!resend) {
    console.log("EMAIL: No RESEND_API_KEY set, skipping verification email to", email);
    return;
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const link = `${baseUrl}/api/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Verify your email - Messina Student Homes",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Welcome, ${name}!</h2>
          <p>Click the button below to verify your email address:</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Verify Email
          </a>
          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            Or copy this link: <br/>
            <a href="${link}" style="color: #4f46e5;">${link}</a>
          </p>
        </div>
      `,
    });
    console.log("EMAIL: Verification sent to", email);
  } catch (error) {
    console.error("EMAIL: Failed to send verification:", error);
  }
}
