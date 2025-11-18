import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.EMAIL_FROM || "noreply@chatati.de";

export async function sendVerificationEmail(email: string, url: string) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Verify your Chatati email",
      html: `
        <h1>Welcome to Chatati!</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${url}">Verify Email</a>
        <p>Or copy this link: ${url}</p>
      `,
    });
    console.log("Verification email sent to", email);
    // TODO store in db that verification email was sent
  } catch (error) {
    console.error("Error sending verification email", error);
  }
}

export async function sendPasswordResetEmail(email: string, url: string) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Reset your Chatati password",
      html: `
        <h1>Reset Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${url}">Reset Password</a>
        <p>Or copy this link: ${url}</p>
      `,
    });
    console.log("Password reset email sent to", email);
    // TODO store reset in db
  } catch (error) {
    console.error("Error sending password reset email", error);
  }
}
