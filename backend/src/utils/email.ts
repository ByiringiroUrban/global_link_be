import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (config.isDev) {
    console.log('\n--- EMAIL (dev mode) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html);
    console.log('--- END EMAIL ---\n');
    return;
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@globallink.com',
    to,
    subject,
    html,
  });
}

export function generateToken(): string {
  return uuidv4();
}

export function buildResetPasswordLink(token: string): string {
  return `${config.frontendUrl}/reset-password?token=${token}`;
}

export function buildVerifyEmailLink(token: string): string {
  return `${config.frontendUrl}/verify-email?token=${token}`;
}
