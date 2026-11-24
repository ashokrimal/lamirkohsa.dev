'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react'
import {
  deleteProject,
  moveProject,
  saveProject,
  updateStudioProjectStatus,
  type ProjectInput,
} from '@/app/actions/studio'
import { updateCmsProjectStatus } from '@/app/actions/content-cms'
import {
  PROJECT_LIFECYCLE_STATUSES,
  getProjectStatusVisual,
  resolveProjectLifecycleStatus,
  type ProjectLifecycleStatus,
} from '@/lib/project-status'
import type { ProjectEntry } from '@/lib/projects'
import type { StudioProject } from '@/lib/studio/data'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-400'

type Draft = ProjectInput

function emptyDraft(): Draft {
  return {
    slug: '',
    title: '',
    category: '',
    completionDate: '',
    summary: '',
    problem: '',
    solution: '',
    techStack: [],
    coverMediaUrl: '',
    liveUrl: '',
    repoUrl: '',
    featuredOrder: null,
    status: 'Active',
    isPublished: true,
  }
}

function draftFrom(project: StudioProject): Draft {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    category: project.category ?? '',
    completionDate: project.completionDate ?? '',
    summary: project.summary ?? '',
    problem: project.problem ?? '',
    solution: project.solution ?? '',
    techStack: project.techStack,
    coverMediaUrl: project.coverMediaUrl ?? '',
    liveUrl: project.liveUrl ?? '',
    repoUrl: project.repoUrl ?? '',
    featuredOrder: project.featuredOrder ?? null,
    status: resolveProjectLifecycleStatus(project.status),
    isPublished: project.isPublished,
  }
}

/** Full CRUD plus featured ordering and status management for the studio `projects` table and CMS case studies. */
export default function WorkManager({
  projects,
  cmsProjects = [],
}: {
  projects: StudioProject[]
  cmsProjects?: ProjectEntry[]
}) {
  const router = useRouter()
  const [items, setItems] = useState<StudioProject[]>(projects)
  const [cmsItems, setCmsItems] = useState<ProjectEntry[]>(cmsProjects)
  const [draft, setDraft] = useState<Draft>(projects[0] ? draftFrom(projects[0]) : emptyDraft())
  const [techText, setTechText] = useState((projects[0]?.techStack ?? []).join(', '))
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [statusPendingId, setStatusPendingId] = useState<number | null>(null)
  const [cmsPendingId, setCmsPendingId] = useState<number | null>(null)

  useEffect(() => {
    setItems(projects)
  }, [projects])

  useEffect(() => {
    setCmsItems(cmsProjects)
  }, [cmsProjects])

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

  const handleQuickStatusToggle = async (
    project: StudioProject,
    nextStatus: ProjectLifecycleStatus,
  ) => {
    if (project.status === nextStatus || statusPendingId === project.id) return
    const previousStatus = project.status
    setStatusPendingId(project.id)
    setStatus(null)
    setItems((current) =>
      current.map((item) => (item.id === project.id ? { ...item, status: nextStatus } : item)),
    )
    setCmsItems((current) =>
      current.map((item) => (item.slug === project.slug ? { ...item, status: nextStatus } : item)),
    )
    if (draft.id === project.id) {
      update({ status: nextStatus })
    }
    try {
      await updateStudioProjectStatus(project.id, nextStatus)
      setStatus(`Status updated to ${nextStatus}.`)
      router.refresh()
    } catch (error) {
      setItems((current) =>
        current.map((item) =>
          item.id === project.id ? { ...item, status: previousStatus } : item,
        ),
      )
      setStatus(error instanceof Error ? error.message : 'Could not update project status.')
    } finally {
      setStatusPendingId(null)
    }
  }

  const handleCmsStatusToggle = async (
    project: ProjectEntry,
    nextStatus: ProjectLifecycleStatus,
  ) => {
    if (resolveProjectLifecycleStatus(project.status) === nextStatus || cmsPendingId === project.id) {
      return
    }
    const previousStatus = project.status
    setCmsPendingId(project.id)
    setStatus(null)
    setCmsItems((current) =>
      current.map((item) => (item.id === project.id ? { ...item, status: nextStatus } : item)),
    )
    setItems((current) =>
      current.map((item) => (item.slug === project.slug ? { ...item, status: nextStatus } : item)),
    )
    try {
      await updateCmsProjectStatus(project.id, nextStatus)
      setStatus(`Updated "${project.title}" status to ${nextStatus}.`)
      router.refresh()
    } catch (error) {
      setCmsItems((current) =>
        current.map((item) =>
          item.id === project.id ? { ...item, status: previousStatus } : item,
        ),
      )
      setStatus(error instanceof Error ? error.message : 'Could not update project status.')
    } finally {
      setCmsPendingId(null)
    }
  }

  return (
    <div className="space-y-5">
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
        <ul className="mt-3 space-y-2">
          {items.map((project, index) => {
            const currentLifecycle = resolveProjectLifecycleStatus(project.status)
            const visual = getProjectStatusVisual(currentLifecycle)
            const isUpdatingStatus = statusPendingId === project.id
            return (
              <li
                key={project.id}
                className={`rounded-lg border p-2.5 text-xs transition-colors ${
                  draft.id === project.id
                    ? 'border-teal-300 bg-teal-50/60 text-teal-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => select(project)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${visual.dotClass}`}
                        aria-hidden="true"
                      />
                      <span className="block truncate font-semibold">{project.title}</span>
                    </span>
                    <span className="block truncate text-[11px] text-slate-400">
                      {index + 1}. /{project.slug} {project.isPublished ? '' : '· draft'}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    #{project.featuredOrder ?? '—'}
                  </span>
                </button>

                <div
                  role="group"
                  aria-label={`Set status for ${project.title}`}
                  className="mt-2 inline-flex flex-wrap items-center gap-1 rounded-md border border-slate-200/80 bg-white/90 p-0.5"
                >
                  {PROJECT_LIFECYCLE_STATUSES.map((option) => {
                    const active = currentLifecycle === option
                    const optionVisual = getProjectStatusVisual(option)
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={isUpdatingStatus}
                        aria-pressed={active}
                        onClick={() => void handleQuickStatusToggle(project, option)}
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-60 ${
                          active
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${optionVisual.dotClass}`}
                          aria-hidden="true"
                        />
                        <span>{option}</span>
                      </button>
                    )
                  })}
                </div>
              </li>
            )
          })}
          {items.length === 0 && (
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
          <label className="block text-xs text-slate-700">
            Completion date
            <input
              value={draft.completionDate ?? ''}
              onChange={(e) => update({ completionDate: e.target.value })}
              placeholder="2025-03-09 or 2025-03"
              className={inputClass}
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              YYYY-MM-DD or YYYY-MM. Feeds datePublished and article:published_time on the
              case study; other wording is ignored.
            </span>
          </label>
          <label className="block text-xs text-slate-700">
            Project status
            <select
              value={resolveProjectLifecycleStatus(draft.status)}
              onChange={(e) => update({ status: e.target.value })}
              className={inputClass}
            >
              {PROJECT_LIFECYCLE_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-700 pt-5">
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

      {cmsItems.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Published case studies (<code className="font-mono text-xs">/projects</code>)
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Toggle the visual status indicator (Green Active · Orange Planning · Gray Archived) directly in the database.
              </p>
            </div>
            {status && (
              <span className="text-[11px] font-medium text-teal-700" role="status">
                {status}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {cmsItems.map((project) => {
              const currentLifecycle = resolveProjectLifecycleStatus(project.status)
              const visual = getProjectStatusVisual(currentLifecycle)
              const isUpdating = cmsPendingId === project.id
              return (
                <div
                  key={`cms-${project.id}`}
                  className="flex flex-col justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <a
                        href={`/projects/${project.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate font-semibold text-slate-900 hover:text-teal-700"
                      >
                        {project.title}
                      </a>
                      <p className="truncate text-[11px] text-slate-400">
                        /projects/{project.slug}
                        {project.status &&
                        project.status.trim().toLowerCase() !== currentLifecycle.toLowerCase()
                          ? ` · ${project.status}`
                          : ''}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${visual.badgeClass}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${visual.dotClass}`} aria-hidden="true" />
                      <span>{visual.lifecycle}</span>
                    </span>
                  </div>

                  <div
                    role="group"
                    aria-label={`Set status for ${project.title}`}
                    className="inline-flex w-full items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"
                  >
                    {PROJECT_LIFECYCLE_STATUSES.map((option) => {
                      const active = currentLifecycle === option
                      const optionVisual = getProjectStatusVisual(option)
                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={isUpdating}
                          aria-pressed={active}
                          onClick={() => void handleCmsStatusToggle(project, option)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-60 ${
                            active
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-white'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${optionVisual.dotClass}`}
                            aria-hidden="true"
                          />
                          <span>{option}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
