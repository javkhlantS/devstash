import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "DevStash <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your DevStash email",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Welcome to DevStash</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Click the button below to verify your email address and activate your account.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 16px;">
          Verify Email
        </a>
        <p style="color: #888; font-size: 14px; margin-top: 24px;">
          This link expires in 24 hours. If you didn't create an account, you can ignore this email.
        </p>
      </div>
    `,
  });
}
