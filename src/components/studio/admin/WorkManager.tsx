'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react'
import { deleteProject, moveProject, saveProject, type ProjectInput } from '@/app/actions/studio'
import type { StudioProject } from '@/lib/studio/data'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-400'

type Draft = ProjectInput

function emptyDraft(): Draft {
  return {
    slug: '',
    title: '',
    category: '',
    summary: '',
    problem: '',
    solution: '',
    techStack: [],
    coverMediaUrl: '',
    liveUrl: '',
    repoUrl: '',
    featuredOrder: null,
    isPublished: true,
  }
}

function draftFrom(project: StudioProject): Draft {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    category: project.category ?? '',
    summary: project.summary ?? '',
    problem: project.problem ?? '',
    solution: project.solution ?? '',
    techStack: project.techStack,
    coverMediaUrl: project.coverMediaUrl ?? '',
    liveUrl: project.liveUrl ?? '',
    repoUrl: project.repoUrl ?? '',
    featuredOrder: project.featuredOrder ?? null,
    isPublished: project.isPublished,
  }
}

/** Full CRUD plus featured ordering for the studio `projects` table. */
export default function WorkManager({ projects }: { projects: StudioProject[] }) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(projects[0] ? draftFrom(projects[0]) : emptyDraft())
  const [techText, setTechText] = useState((projects[0]?.techStack ?? []).join(', '))
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const select = (project: StudioProject) => {
    setDraft(draftFrom(project))
    setTechText(project.techStack.join(', '))
    setStatus(null)
  }

  const startNew = () => {
    setDraft(emptyDraft())
    setTechText('')
    setStatus(null)
  }

  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }))

  const save = async () => {
    setBusy(true)
    setStatus(null)
    try {
      await saveProject({
        ...draft,
        techStack: techText.split(',').map((tech) => tech.trim()).filter(Boolean),
      })
      setStatus('Project published.')
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save this project.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!draft.id) return
    setBusy(true)
    try {
      await deleteProject(draft.id)
      setDraft(emptyDraft())
      setTechText('')
      setStatus('Project deleted.')
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not delete this project.')
    } finally {
      setBusy(false)
    }
  }

  const move = async (direction: -1 | 1) => {
    if (!draft.id) return
    setBusy(true)
    try {
      await moveProject(draft.id, direction)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-2xl border border-slate-200 bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Projects</h2>
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-800"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New
          </button>
        </div>
        <ul className="mt-3 space-y-1.5">
          {projects.map((project, index) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => select(project)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-xs ${
                  draft.id === project.id
                    ? 'border-teal-300 bg-teal-50/60 text-teal-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{project.title}</span>
                  <span className="block truncate text-[11px] text-slate-400">
                    {index + 1}. /{project.slug} {project.isPublished ? '' : '· draft'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">#{project.featuredOrder ?? '—'}</span>
              </button>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
              No projects yet. Create one, or run <code>pnpm studio:seed</code> to migrate the existing
              case studies.
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-surface p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">
          {draft.id ? 'Edit project' : 'New project'}
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-xs text-slate-700">
            Title
            <input value={draft.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Slug
            <input value={draft.slug} onChange={(e) => update({ slug: e.target.value })} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Category
            <input
              value={draft.category ?? ''}
              onChange={(e) => update({ category: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block text-xs text-slate-700">
            Featured order
            <input
              type="number"
              value={draft.featuredOrder ?? ''}
              onChange={(e) =>
                update({ featuredOrder: e.target.value === '' ? null : Number(e.target.value) })
              }
              className={inputClass}
            />
          </label>
          <label className="block text-xs text-slate-700 sm:col-span-2">
            Summary
            <textarea
              rows={2}
              value={draft.summary ?? ''}
              onChange={(e) => update({ summary: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block text-xs text-slate-700 sm:col-span-2">
            Problem
            <textarea
              rows={3}
              value={draft.problem ?? ''}
              onChange={(e) => update({ problem: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block text-xs text-slate-700 sm:col-span-2">
            Solution
            <textarea
              rows={3}
              value={draft.solution ?? ''}
              onChange={(e) => update({ solution: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block text-xs text-slate-700 sm:col-span-2">
            Tech stack (comma separated)
            <input value={techText} onChange={(e) => setTechText(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700 sm:col-span-2">
            Cover media URL
            <input
              value={draft.coverMediaUrl ?? ''}
              onChange={(e) => update({ coverMediaUrl: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block text-xs text-slate-700">
            Live URL
            <input value={draft.liveUrl ?? ''} onChange={(e) => update({ liveUrl: e.target.value })} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Repo URL
            <input value={draft.repoUrl ?? ''} onChange={(e) => update({ repoUrl: e.target.value })} className={inputClass} />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={draft.isPublished ?? true}
              onChange={(e) => update({ isPublished: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            Published
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" /> Save project
          </button>
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={busy || !draft.id}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"
            aria-label="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={busy || !draft.id}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"
            aria-label="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy || !draft.id}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
          </button>
          {status && (
            <span className="text-[11px] font-medium text-slate-600" role="status">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
