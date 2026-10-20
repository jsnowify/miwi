import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import nodemailer from 'nodemailer';

export function createAuth(db, client, env = process.env, mailTransport) {
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) throw new Error('Set BETTER_AUTH_SECRET to at least 32 random characters.');
  const mail = mailTransport || (env.SMTP_URL && env.MAIL_FROM ? nodemailer.createTransport(env.SMTP_URL) : null);
  return betterAuth({
    database: mongodbAdapter(db, { client }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || 'http://localhost:5173',
    trustedOrigins: [env.BETTER_AUTH_URL || 'http://localhost:5173'],
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      ...(mail ? { sendResetPassword: async ({ user, url }) => {
        await mail.sendMail({ from: env.MAIL_FROM, to: user.email, subject: 'Reset your Miwi password', text: `Reset your password using this link: ${url}\nIf you did not request this, you can ignore this email.` });
      } } : {}),
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 30,
      customRules: { '/get-session': { window: 60, max: 120 } },
    },
    advanced: { useSecureCookies: (env.BETTER_AUTH_URL || '').startsWith('https://'), ipAddress: { ipAddressHeaders: ['x-miwi-client-ip'] } },
  });
}
