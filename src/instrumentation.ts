/**
 * Runs once per server start (Next.js instrumentation hook).
 *
 * The mail setup is checked here so a deployment missing RESEND_API_KEY,
 * RESEND_EMAIL_DOMAIN or CONTACT_TO_EMAIL logs a clear warning instead of
 * quietly dropping acknowledgements and newsletter mail.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { reportMailConfiguration } = await import('@/lib/mailer')
  reportMailConfiguration()
}
