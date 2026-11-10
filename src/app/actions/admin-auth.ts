'use server'

import { cookies } from 'next/headers'
import {
  ADMIN_PASSWORD_MIN_LENGTH,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  changeAdminPassword,
  createAdminSessionToken,
  hasAdminSession,
  setupAdminAccount,
} from '@/lib/admin-auth'

export type AdminAuthActionState = { ok: true } | { ok: false; error: string }

async function startSession() {
  const token = await createAdminSessionToken()
  if (!token) throw new Error('The owner account could not start a session.')
  cookies().set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  })
}

/** One-time creation of the owner account, then signs them in. */
export async function setupOwnerAccount(formData: FormData): Promise<AdminAuthActionState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const confirmation = String(formData.get('confirmPassword') ?? '')

  if (password !== confirmation) {
    return { ok: false, error: 'The two passwords do not match.' }
  }

  try {
    await setupAdminAccount(email, password)
    await startSession()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'The owner account could not be created.' }
  }
}

/** Changes the signed-in owner's password and keeps the current session valid. */
export async function changeOwnerPassword(formData: FormData): Promise<AdminAuthActionState> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: 'Your session expired. Sign in again.' }
  }

  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')
  const confirmation = String(formData.get('confirmPassword') ?? '')

  if (newPassword.length < ADMIN_PASSWORD_MIN_LENGTH) {
    return { ok: false, error: `Choose a password with at least ${ADMIN_PASSWORD_MIN_LENGTH} characters.` }
  }
  if (newPassword !== confirmation) {
    return { ok: false, error: 'The two new passwords do not match.' }
  }

  try {
    await changeAdminPassword(currentPassword, newPassword)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'The password could not be changed.' }
  }
}
