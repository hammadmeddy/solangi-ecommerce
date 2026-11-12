import nodemailer from "nodemailer";

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
}

function transporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim().replace(/\s+/g, "");
  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS are required to send email OTP");
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const from =
    process.env.SMTP_FROM?.trim() ||
    `Solangi Ecommerce <${process.env.SMTP_USER!.trim()}>`;

  const transport = transporter();
  await transport.sendMail({
    from,
    to,
    subject: `${code} is your Solangi verification code`,
    text: `Your Solangi one-time code is ${code}. It expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Georgia,serif;line-height:1.5;color:#1a1a1a">
        <p>Your Solangi one-time code is:</p>
        <p style="font-size:28px;letter-spacing:0.2em;font-weight:700">${code}</p>
        <p>It expires in 10 minutes. If you did not request this, ignore this email.</p>
        <p style="color:#666;font-size:12px">YOUR TRUST IS OUR WEALTH · solangiecommerce.com</p>
      </div>
    `,
  });
}
