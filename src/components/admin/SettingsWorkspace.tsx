'use client'

import { useState } from 'react'
import { LogOut, KeyRound, Plug } from 'lucide-react'
import ChangePasswordForm from '@/components/admin/ChangePasswordForm'
import {
  CmsFormField,
  CmsInput,
  CmsSubmitButton,
} from '@/components/admin/ui/CmsFormPrimitives'
import { saveProfileSettings } from '@/app/actions/settings'

type ProfileSettings = {
  githubUsername: string | null
  malUsername: string | null
  malUsernames?: string[] | null
  anilistUsernames?: string[] | null
  lastfmUsername: string | null
  listenbrainzUsername: string | null
  spotifyProfileUrl: string | null
}

/**
 * The studio settings page: integrations and the owner account live together
 * here instead of being scattered across the dashboard.
 */
export default function SettingsWorkspace({
  settings,
  email,
  source,
}: {
  settings: ProfileSettings | null
  email: string
  source: 'database' | 'environment'
}) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await saveProfileSettings(new FormData(event.currentTarget))
      setStatus({ tone: 'success', text: 'Connections saved. Public pages refresh on their next request.' })
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not save settings.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Public connections for the portfolio and the owner account for this studio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Plug className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Media sync &amp; usernames</h2>
              <p className="text-[11px] text-slate-500">
                Public profile handles used by GitHub activity, music and media sections.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <CmsFormField label="GitHub Username" hint="Repos & commit streaks">
              <CmsInput
                name="githubUsername"
                defaultValue={settings?.githubUsername || ''}
                placeholder="e.g. ashokrimal"
              />
            </CmsFormField>

            <CmsFormField label="Last.fm Username" hint="Scrobble history">
              <CmsInput
                name="lastfmUsername"
                defaultValue={settings?.lastfmUsername || ''}
                placeholder="e.g. lamirkohsa"
              />
            </CmsFormField>

            <CmsFormField label="ListenBrainz Username" hint="Now playing tracking">
              <CmsInput
                name="listenbrainzUsername"
                defaultValue={settings?.listenbrainzUsername || ''}
                placeholder="e.g. ashokrimal"
              />
            </CmsFormField>

            <CmsFormField label="Spotify Profile URL" hint="Public profile link">
              <CmsInput
                name="spotifyProfileUrl"
                defaultValue={settings?.spotifyProfileUrl || ''}
                placeholder="https://open.spotify.com/user/..."
              />
            </CmsFormField>

            <CmsFormField label="MyAnimeList Usernames" hint="Comma-separated">
              <CmsInput
                name="malUsernames"
                defaultValue={
                  settings?.malUsernames?.join(', ') || settings?.malUsername || ''
                }
                placeholder="e.g. ashokrimal, user2"
              />
            </CmsFormField>

            <CmsFormField label="AniList Usernames" hint="Comma-separated">
              <CmsInput
                name="anilistUsernames"
                defaultValue={settings?.anilistUsernames?.join(', ') || ''}
                placeholder="e.g. ashokrimal"
              />
            </CmsFormField>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p
              className={`text-[11px] ${
                status?.tone === 'error' ? 'text-rose-600' : 'text-emerald-700'
              }`}
              role="status"
            >
              {status?.text ?? ''}
            </p>
            <CmsSubmitButton type="submit" loading={saving}>
              Save settings
            </CmsSubmitButton>
          </div>
        </section>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Owner account</h2>
            <p className="text-[11px] text-slate-500">
              Signed in as {email || 'the site owner'}.{' '}
              {source === 'environment'
                ? 'This account comes from deployment variables; changing the password stores it in the database.'
                : 'The password is stored as a salted scrypt hash.'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ChangePasswordForm />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <p className="text-[11px] text-slate-500">
            Other active sessions stay signed in until their cookie expires (up to 8 hours).
          </p>
          {/* Sign-out is a route handler that clears the cookie and redirects, so
              it needs a full page navigation rather than client-side routing. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/admin/sign-out"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </a>
        </div>
      </section>
    </div>
  )
}
