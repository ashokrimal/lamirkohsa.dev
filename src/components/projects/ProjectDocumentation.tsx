'use client'

import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  Github,
  Globe,
  Layers,
  Wrench,
} from 'lucide-react'
import type {
  DocumentationSection,
  DocumentationToolGroup,
  DocumentationWorkflowStep,
} from '@/lib/projects'

type DocViewTab = 'all' | 'process' | 'product' | 'workflow'

interface ProjectDocumentationProps {
  projectTitle: string
  sections: DocumentationSection[]
  workflowSteps?: DocumentationWorkflowStep[]
  recommendedTools?: DocumentationToolGroup[]
  liveUrl?: string
  repoUrl?: string
  hasCustomDocumentation?: boolean
}

export function ProjectDocumentation({
  projectTitle,
  sections,
  workflowSteps = [],
  recommendedTools = [],
  liveUrl,
  repoUrl,
  hasCustomDocumentation,
}: ProjectDocumentationProps) {
  const [activeTab, setActiveTab] = useState<DocViewTab>('all')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const validLiveUrl = liveUrl && liveUrl !== '#' ? liveUrl : undefined

  const processSections = sections.filter((section) => section.track === 'process')
  const productSections = sections.filter((section) => section.track === 'product')

  const visibleSections =
    activeTab === 'process'
      ? processSections
      : activeTab === 'product'
        ? productSections
        : sections

  const handleCopyCode = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1800)
    } catch {}
  }

  const jumpToSection = (section: DocumentationSection) => {
    if (activeTab === 'workflow' || (activeTab !== 'all' && activeTab !== section.track)) {
      setActiveTab('all')
    }
    requestAnimationFrame(() => {
      const target = document.getElementById(section.id)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  const jumpToDocId = (docId: string) => {
    setActiveTab('all')
    setTimeout(() => {
      const target = document.getElementById(docId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 60)
  }

  if (sections.length === 0) return null

  const tabs: Array<{ id: DocViewTab; label: string; count?: number }> = [
    { id: 'all', label: 'All documents', count: sections.length },
    { id: 'process', label: 'Process docs', count: processSections.length },
    { id: 'product', label: 'Product docs', count: productSections.length },
    { id: 'workflow', label: 'Workflow & tools', count: workflowSteps.length || undefined },
  ]

  return (
    <div className="space-y-8">
      {/* Track Summary & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-line-hairline">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-medium text-ink">
            Process &amp; Product Documentation Architecture
          </p>
          <p className="text-xs md:text-sm text-muted leading-relaxed">
            Organized into <span className="text-ink font-medium">Process Documentation</span>{' '}
            (how {projectTitle} was specified, tested, and operated) and{' '}
            <span className="text-ink font-medium">Product Documentation</span> (system
            architecture, APIs, codebase setup, and release notes).
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Documentation track filter"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-line-subtle bg-overlay-faint self-start lg:self-auto"
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="font-mono text-[11px] text-muted tabular-nums">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Core Documents Matrix (visible across document tabs) */}
      {activeTab !== 'workflow' && (
        <div className="apple-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-line-hairline">
            <div className="flex items-center gap-2 text-xs font-medium text-ink">
              <Layers className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
              <span>Core Documentation Index</span>
            </div>
            <span className="text-[11px] font-mono text-muted tabular-nums">
              {visibleSections.length} {visibleSections.length === 1 ? 'record' : 'records'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line-hairline text-[11px] text-muted">
                  <th scope="col" className="py-2.5 px-5 font-medium whitespace-nowrap">
                    Category
                  </th>
                  <th scope="col" className="py-2.5 px-4 font-medium whitespace-nowrap">
                    Document Name
                  </th>
                  <th scope="col" className="py-2.5 px-4 font-medium whitespace-nowrap">
                    Track
                  </th>
                  <th scope="col" className="py-2.5 px-5 font-medium min-w-[260px]">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-hairline">
                {visibleSections.map((section) => (
                  <tr
                    key={`index-${section.id}`}
                    className="transition-colors hover:bg-overlay-faint/70"
                  >
                    <td className="py-3 px-5 text-muted whitespace-nowrap align-top">
                      <span className="font-mono text-[11px] tabular-nums mr-1.5">
                        {section.number}
                      </span>
                      <span>{section.category}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-ink align-top">
                      <button
                        type="button"
                        onClick={() => jumpToSection(section)}
                        className="inline-flex items-center gap-1.5 text-left hover:text-accent transition-colors cursor-pointer"
                      >
                        <span>{section.title}</span>
                        <ArrowDownRight className="w-3 h-3 text-accent shrink-0" aria-hidden="true" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-ink-secondary whitespace-nowrap align-top">
                      {section.track === 'process' ? 'Process Doc' : 'Product Doc'}
                    </td>
                    <td className="py-3 px-5 text-muted leading-relaxed align-top">
                      {section.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Two-Column Documentation Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-12 items-start">
        {/* Sticky Documentation Table of Contents */}
        <aside className="lg:sticky lg:top-24 space-y-6">
          <div className="flex items-center gap-2 text-xs font-medium text-ink">
            <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>{hasCustomDocumentation ? 'Project Documentation' : 'Technical Dossier'}</span>
          </div>

          <nav aria-label={`${projectTitle} documentation sections`} className="space-y-5">
            {processSections.length > 0 && (
              <div className="space-y-1.5 border-t border-line-hairline pt-3">
                <p className="px-2.5 text-[11px] font-medium text-muted">Process Documentation</p>
                <ul className="flex flex-wrap lg:flex-col gap-1">
                  {processSections.map((section) => (
                    <li key={`toc-${section.id}`}>
                      <button
                        type="button"
                        onClick={() => jumpToSection(section)}
                        className="w-full text-left inline-flex lg:flex items-baseline gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-muted transition-colors hover:bg-overlay-faint hover:text-ink cursor-pointer"
                      >
                        <span className="font-mono text-[10px] text-accent tabular-nums shrink-0">
                          {section.number}
                        </span>
                        <span className="leading-snug">{section.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {productSections.length > 0 && (
              <div className="space-y-1.5 border-t border-line-hairline pt-3">
                <p className="px-2.5 text-[11px] font-medium text-muted">Product Documentation</p>
                <ul className="flex flex-wrap lg:flex-col gap-1">
                  {productSections.map((section) => (
                    <li key={`toc-${section.id}`}>
                      <button
                        type="button"
                        onClick={() => jumpToSection(section)}
                        className="w-full text-left inline-flex lg:flex items-baseline gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-muted transition-colors hover:bg-overlay-faint hover:text-ink cursor-pointer"
                      >
                        <span className="font-mono text-[10px] text-accent tabular-nums shrink-0">
                          {section.number}
                        </span>
                        <span className="leading-snug">{section.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          {(validLiveUrl || repoUrl) && (
            <div className="border-t border-line-hairline pt-4 space-y-2 text-xs">
              <p className="text-[11px] font-medium text-muted">Project references</p>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {validLiveUrl && (
                  <a
                    href={validLiveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-accent transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                    <span className="truncate">Live deployment</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                  </a>
                )}
                {repoUrl && (
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-accent transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                    <span className="truncate">Source repository</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Pane */}
        <div className="min-w-0 max-w-3xl">
          {activeTab === 'workflow' ? (
            <div className="space-y-10">
              {/* 5-Step Documentation Methodology */}
              <section className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-mono text-accent tabular-nums">Methodology</span>
                    <span aria-hidden="true">·</span>
                    <span>Step-by-step playbook</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-ink">
                    Five-step engineering documentation workflow
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    How requirements, architecture diagrams, repository READMEs, QA verification,
                    and scheduled audits fit together across {projectTitle}&apos;s build cycle.
                  </p>
                </div>

                <div className="space-y-4">
                  {workflowSteps.map((item) => (
                    <article
                      key={item.step}
                      className="apple-card p-5 md:p-6 space-y-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-mono text-xs text-accent tabular-nums">
                            {item.step}
                          </span>
                          <h4 className="text-base font-semibold tracking-tight text-ink">
                            {item.title}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => jumpToDocId(item.linkedDocId)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline shrink-0 cursor-pointer"
                        >
                          <span>{item.linkedDocLabel}</span>
                          <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>

                      <p className="text-sm text-ink-secondary leading-relaxed">{item.summary}</p>

                      <ul className="space-y-1.5 pt-1 text-xs md:text-[13px] text-muted">
                        {item.practices.map((practice) => (
                          <li key={practice} className="flex items-start gap-2.5 leading-relaxed">
                            <span
                              className="mt-2 h-1 w-1 rounded-full bg-accent shrink-0"
                              aria-hidden="true"
                            />
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              {/* Recommended Toolchain */}
              {recommendedTools.length > 0 && (
                <section className="pt-8 border-t border-line-hairline space-y-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink">
                    <Wrench className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                    <span>Recommended Documentation Toolchain</span>
                  </div>
                  <div className="apple-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-line-hairline text-[11px] text-muted">
                            <th scope="col" className="py-3 px-5 font-medium whitespace-nowrap">
                              Documentation Area
                            </th>
                            <th scope="col" className="py-3 px-4 font-medium whitespace-nowrap">
                              Standard Tools
                            </th>
                            <th scope="col" className="py-3 px-5 font-medium min-w-[220px]">
                              Role in Delivery
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line-hairline">
                          {recommendedTools.map((group) => (
                            <tr key={group.domain}>
                              <td className="py-3.5 px-5 font-medium text-ink whitespace-nowrap align-top">
                                {group.domain}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[11px] text-ink-secondary align-top">
                                {group.tools}
                              </td>
                              <td className="py-3.5 px-5 text-muted leading-relaxed align-top">
                                {group.usage}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {visibleSections.map((section, sectionIndex) => (
                <article
                  key={section.id}
                  id={section.id}
                  className={`scroll-mt-24 ${
                    sectionIndex > 0 ? 'pt-9 border-t border-line-hairline' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                      <span className="font-mono text-accent tabular-nums">{section.number}</span>
                      <span aria-hidden="true">·</span>
                      <span>{section.track === 'process' ? 'Process Documentation' : 'Product Documentation'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{section.category}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-ink">
                      {section.title}
                    </h3>
                    {section.purpose && (
                      <p className="text-xs md:text-sm text-muted leading-relaxed">
                        {section.purpose}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 space-y-5">
                    {section.blocks.map((block, blockIndex) => {
                      const blockKey = `${section.id}-${blockIndex}`

                      if (block.type === 'subheading' && block.text) {
                        return (
                          <h4
                            key={blockKey}
                            className="pt-2 text-sm font-semibold text-ink tracking-tight"
                          >
                            {block.text}
                          </h4>
                        )
                      }

                      if (block.type === 'paragraph' && block.text) {
                        return (
                          <p
                            key={blockKey}
                            className="text-sm md:text-[15px] text-ink-secondary leading-7"
                          >
                            {block.text}
                          </p>
                        )
                      }

                      if (block.type === 'list' && block.items?.length) {
                        return (
                          <ul key={blockKey} className="space-y-2.5 text-sm text-ink-secondary">
                            {block.items.map((item, idx) => (
                              <li
                                key={`${blockKey}-${idx}`}
                                className="flex items-start gap-3 leading-relaxed"
                              >
                                <span
                                  className="mt-2.5 h-1 w-1 rounded-full bg-accent shrink-0"
                                  aria-hidden="true"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )
                      }

                      if (block.type === 'ordered' && block.items?.length) {
                        return (
                          <ol key={blockKey} className="space-y-2.5 text-sm text-ink-secondary">
                            {block.items.map((item, idx) => (
                              <li
                                key={`${blockKey}-${idx}`}
                                className="flex items-start gap-3 leading-relaxed"
                              >
                                <span className="mt-0.5 font-mono text-[11px] font-medium text-accent tabular-nums shrink-0">
                                  {String(idx + 1).padStart(2, '0')}.
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ol>
                        )
                      }

                      if (block.type === 'kv' && block.pairs?.length) {
                        return (
                          <dl
                            key={blockKey}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                          >
                            {block.pairs.map((pair) => (
                              <div
                                key={pair.label}
                                className="rounded-xl border border-line-subtle bg-overlay-faint p-4 space-y-1"
                              >
                                <dt className="text-[11px] font-medium text-muted">{pair.label}</dt>
                                <dd className="text-sm font-semibold text-ink tabular-nums">
                                  {pair.value}
                                </dd>
                                {pair.note && (
                                  <p className="text-xs text-muted leading-snug">{pair.note}</p>
                                )}
                              </div>
                            ))}
                          </dl>
                        )
                      }

                      if (block.type === 'table' && block.headers?.length && block.rows?.length) {
                        return (
                          <div
                            key={blockKey}
                            className="overflow-x-auto rounded-xl border border-line-subtle"
                          >
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-line-hairline bg-overlay-faint text-[11px] text-muted">
                                  {block.headers.map((header) => (
                                    <th
                                      key={header}
                                      scope="col"
                                      className="py-2.5 px-4 font-medium whitespace-nowrap"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-line-hairline">
                                {block.rows.map((row, rowIdx) => (
                                  <tr key={`${blockKey}-row-${rowIdx}`}>
                                    {row.map((cell, cellIdx) => (
                                      <td
                                        key={`${blockKey}-row-${rowIdx}-col-${cellIdx}`}
                                        className={`py-3 px-4 align-top leading-relaxed ${
                                          cellIdx === 0
                                            ? 'font-mono text-[11px] font-medium text-accent whitespace-nowrap tabular-nums'
                                            : cellIdx === 1
                                              ? 'font-medium text-ink'
                                              : 'text-ink-secondary'
                                        }`}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      }

                      if (block.type === 'code' && block.text !== undefined) {
                        const isCopied = copiedKey === blockKey
                        return (
                          <div
                            key={blockKey}
                            className="overflow-hidden rounded-xl border border-line-subtle bg-overlay-faint"
                          >
                            <div className="flex items-center justify-between border-b border-line-hairline px-3.5 py-2 text-[11px] text-muted">
                              <span className="font-mono">{block.language || 'code'}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(blockKey, block.text || '')}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-muted hover:bg-overlay hover:text-ink transition-colors cursor-pointer"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-accent" aria-hidden="true" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" aria-hidden="true" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-ink">
                              <code>{block.text}</code>
                            </pre>
                          </div>
                        )
                      }

                      return null
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
