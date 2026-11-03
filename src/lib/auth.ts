import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { Resend } from 'resend'

const origin = (value?: string) => value ? (value.startsWith('http') ? value : `https://${value}`) : undefined
const trustedOrigins = [
  'http://localhost:3000',
  origin(process.env.V0_RUNTIME_URL), origin(process.env.V0_DEV_APP_URL), origin(process.env.V0_BUILD_URL), origin(process.env.V0_SANDBOX_URL),
  origin(process.env.VERCEL_URL), origin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
].filter(Boolean) as string[]

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const domain = process.env.RESEND_EMAIL_DOMAIN || 'resend.dev'
      await resend.emails.send({
        from: `Portfolio Admin <noreply@${domain}>`,
        to: user.email,
        subject: 'Reset your admin password',
        html: `<p>You requested a password reset for the portfolio admin.</p><p><a href="${url}">Reset your password</a></p><p>This link expires soon. If you did not request it, you can ignore this email.</p>`,
      })
    },
  },
  baseURL: origin(process.env.BETTER_AUTH_URL) || origin(process.env.VERCEL_PROJECT_PRODUCTION_URL) || origin(process.env.VERCEL_URL) || origin(process.env.V0_RUNTIME_URL),
  trustedOrigins,
  ...(process.env.NODE_ENV === 'development' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})
