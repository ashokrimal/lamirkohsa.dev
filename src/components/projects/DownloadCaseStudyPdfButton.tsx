'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, CheckCircle2, FileDown, Loader2, X } from 'lucide-react'
import type { ProjectDossier, ProjectEntry } from '@/lib/projects'
import { sensoryAudio } from '@/lib/sensory-audio'
import { toSlug } from '@/lib/slug'

interface DownloadCaseStudyPdfButtonProps {
  project: ProjectEntry
  dossier: ProjectDossier
}

const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const emptySubscribe = () => () => {}

function sanitizePdfText(input: string): string {
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2192|\u25B6|\u251C|\u2514|\u2500|\u2502/g, (ch) => {
      if (ch === '\u2192' || ch === '\u25B6') return '->'
      if (ch === '\u251C' || ch === '\u2514') return '|-'
      if (ch === '\u2500') return '-'
      return '|'
    })
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
}

export function DownloadCaseStudyPdfButton({
  project,
  dossier,
}: DownloadCaseStudyPdfButtonProps) {
  const reduceMotion = useReducedMotion()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [toastOpen, setToastOpen] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const dismissToast = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setToastOpen(false)
  }, [])

  const handleDownloadPdf = useCallback(async () => {
    if (status === 'generating') return
    sensoryAudio.playClick()
    setStatus('generating')

    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 18
      const contentWidth = pageWidth - margin * 2
      const bottomLimit = pageHeight - 18
      let y = 20

      const checkSpace = (needed: number) => {
        if (y + needed > bottomLimit) {
          doc.addPage()
          y = 20
        }
      }

      const writeWrapped = (
        rawText: string,
        options?: {
          fontSize?: number
          style?: 'normal' | 'bold'
          font?: 'helvetica' | 'courier'
          color?: [number, number, number]
          indent?: number
          lineHeight?: number
          spacingAfter?: number
        },
      ) => {
        const fontSize = options?.fontSize ?? 10
        const font = options?.font ?? 'helvetica'
        const style = options?.style ?? 'normal'
        const color = options?.color ?? [55, 58, 64]
        const indent = options?.indent ?? 0
        const lineHeight = options?.lineHeight ?? fontSize * 0.45
        const spacingAfter = options?.spacingAfter ?? 2

        const clean = sanitizePdfText(rawText)
        if (!clean.trim()) return

        doc.setFont(font, style)
        doc.setFontSize(fontSize)
        doc.setTextColor(color[0], color[1], color[2])

        const lines = doc.splitTextToSize(clean, contentWidth - indent) as string[]
        for (const line of lines) {
          checkSpace(lineHeight + 1)
          doc.text(line, margin + indent, y)
          y += lineHeight
        }
        y += spacingAfter
      }

      const writeSectionHeading = (label: string) => {
        checkSpace(14)
        y += 3
        doc.setDrawColor(215, 212, 205)
        doc.line(margin, y, pageWidth - margin, y)
        y += 6
        writeWrapped(label, {
          fontSize: 13,
          style: 'bold',
          color: [29, 29, 31],
          lineHeight: 5.5,
          spacingAfter: 2.5,
        })
      }

      // Header Banner Block
      writeWrapped(`${project.category || 'Engineering'} Case Study`, {
        fontSize: 9,
        style: 'bold',
        color: [63, 93, 73],
        spacingAfter: 1.5,
      })
      writeWrapped(project.title, {
        fontSize: 20,
        style: 'bold',
        color: [24, 24, 27],
        lineHeight: 8,
        spacingAfter: 2.5,
      })

      const metaParts = [
        project.category,
        project.period || project.completionDate,
        project.status,
      ].filter(Boolean)
      if (metaParts.length > 0) {
        writeWrapped(metaParts.join('  |  '), {
          fontSize: 9.5,
          color: [105, 110, 118],
          spacingAfter: 3,
        })
      }

      if (project.summary || project.description) {
        writeWrapped(project.summary || project.description || '', {
          fontSize: 10.5,
          color: [45, 48, 54],
          lineHeight: 5,
          spacingAfter: 3,
        })
      }

      const links = [
        project.live && project.live !== '#' ? `Live: ${project.live}` : '',
        project.github && project.github !== '#' ? `Source: ${project.github}` : '',
      ].filter(Boolean)
      if (links.length > 0) {
        writeWrapped(links.join('   |   '), {
          fontSize: 9,
          color: [63, 93, 73],
          spacingAfter: 3,
        })
      }

      // Specifications Section
      writeSectionHeading('01. Project Specifications')
      writeWrapped(`Process Model: ${dossier.model.name} (${dossier.model.cadence})`, {
        fontSize: 9.5,
        spacingAfter: 1.5,
      })
      writeWrapped(`Timeline & Duration: ${dossier.duration.headline} - ${dossier.duration.detail}`, {
        fontSize: 9.5,
        spacingAfter: 1.5,
      })
      writeWrapped(`Cost Profile: ${dossier.cost.headline}`, {
        fontSize: 9.5,
        spacingAfter: 1.5,
      })
      for (const layer of dossier.cost.breakdown) {
        writeWrapped(`- ${layer.layer}: ${layer.provider} (${layer.cost})`, {
          fontSize: 9,
          indent: 3,
          color: [85, 90, 96],
          spacingAfter: 1,
        })
      }

      // Brief, Challenge & Solution
      if (dossier.challengeText || dossier.solutionText || dossier.caseStudyPlanText) {
        writeSectionHeading('02. Challenge & Engineering Approach')
        if (dossier.challengeText) {
          writeWrapped('The Challenge', { fontSize: 10.5, style: 'bold', color: [29, 29, 31], spacingAfter: 1 })
          writeWrapped(dossier.challengeText, { fontSize: 9.5, spacingAfter: 3 })
        }
        if (dossier.solutionText) {
          writeWrapped('Engineering Approach', { fontSize: 10.5, style: 'bold', color: [29, 29, 31], spacingAfter: 1 })
          writeWrapped(dossier.solutionText, { fontSize: 9.5, spacingAfter: 3 })
        }
        if (dossier.caseStudyPlanText) {
          writeWrapped('Execution & Research Plan', { fontSize: 10.5, style: 'bold', color: [29, 29, 31], spacingAfter: 1 })
          writeWrapped(dossier.caseStudyPlanText, { fontSize: 9.5, spacingAfter: 3 })
        }
      }

      // Phase-by-Phase Execution Roadmap
      if (project.phases.length > 0) {
        writeSectionHeading('03. Execution Roadmap & Phases')
        project.phases.forEach((phase, idx) => {
          const stateLabel = phase.completed ? 'Completed' : 'Planned'
          const phaseHeader = `${phase.phase || `Phase ${idx + 1}`}: ${phase.name} [${stateLabel}]${
            phase.period ? ` (${phase.period})` : ''
          }`
          writeWrapped(phaseHeader, {
            fontSize: 10,
            style: 'bold',
            color: [29, 29, 31],
            spacingAfter: 1,
          })
          if (phase.description) {
            writeWrapped(phase.description, {
              fontSize: 9.5,
              indent: 3,
              spacingAfter: 2.5,
            })
          }
        })
      }

      // Technology Stack & Shipped Capabilities
      if (dossier.techDetails.length > 0 || project.features.length > 0) {
        writeSectionHeading('04. Architecture, Stack & Capabilities')
        if (dossier.techDetails.length > 0) {
          writeWrapped('Technology Stack & Roles', {
            fontSize: 10.5,
            style: 'bold',
            color: [29, 29, 31],
            spacingAfter: 1.5,
          })
          for (const tech of dossier.techDetails) {
            writeWrapped(`- ${tech.name} [${tech.layer}]: ${tech.role}`, {
              fontSize: 9,
              indent: 3,
              spacingAfter: 1.2,
            })
          }
        }
        if (project.features.length > 0) {
          y += 1.5
          writeWrapped('Shipped Capabilities', {
            fontSize: 10.5,
            style: 'bold',
            color: [29, 29, 31],
            spacingAfter: 1.5,
          })
          for (const feature of project.features) {
            writeWrapped(`- ${feature}`, {
              fontSize: 9.5,
              indent: 3,
              spacingAfter: 1.2,
            })
          }
        }
      }

      // Project Structure
      if (dossier.structure.tree) {
        writeSectionHeading('05. Codebase Structure')
        writeWrapped(dossier.structure.architectureStyle, {
          fontSize: 10,
          style: 'bold',
          color: [29, 29, 31],
          spacingAfter: 1.5,
        })
        writeWrapped(dossier.structure.tree, {
          font: 'courier',
          fontSize: 8.5,
          lineHeight: 4,
          color: [45, 48, 54],
          spacingAfter: 3,
        })
      }

      // Documentation Dossier
      if (dossier.documentationSections.length > 0) {
        writeSectionHeading('06. Technical Documentation Dossier')
        for (const section of dossier.documentationSections) {
          writeWrapped(`${section.number}. ${section.title} (${section.category})`, {
            fontSize: 10.5,
            style: 'bold',
            color: [29, 29, 31],
            spacingAfter: 1,
          })
          if (section.purpose) {
            writeWrapped(section.purpose, {
              fontSize: 9,
              color: [105, 110, 118],
              spacingAfter: 1.5,
            })
          }
          for (const block of section.blocks) {
            if ((block.type === 'subheading' || block.type === 'paragraph') && block.text) {
              writeWrapped(block.text, {
                fontSize: block.type === 'subheading' ? 9.5 : 9,
                style: block.type === 'subheading' ? 'bold' : 'normal',
                spacingAfter: 1.5,
              })
            } else if ((block.type === 'list' || block.type === 'ordered') && block.items?.length) {
              block.items.forEach((item, idx) => {
                const prefix = block.type === 'ordered' ? `${idx + 1}. ` : '- '
                writeWrapped(`${prefix}${item}`, {
                  fontSize: 9,
                  indent: 3,
                  spacingAfter: 1,
                })
              })
            } else if (block.type === 'kv' && block.pairs?.length) {
              for (const pair of block.pairs) {
                writeWrapped(`- ${pair.label}: ${pair.value}`, {
                  fontSize: 9,
                  indent: 3,
                  spacingAfter: 1,
                })
              }
            }
          }
          y += 2
        }
      }

      // Running Footer with Page Numbers
      const totalPages = doc.getNumberOfPages()
      const cleanFooterTitle = sanitizePdfText(project.title)
      for (let p = 1; p <= totalPages; p += 1) {
        doc.setPage(p)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(130, 134, 140)
        doc.text(`${cleanFooterTitle} - Case Study`, margin, pageHeight - 10)
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 10, {
          align: 'right',
        })
      }

      const fileSlug = project.slug || toSlug(project.title) || 'project'
      doc.save(`${fileSlug}-case-study.pdf`)

      sensoryAudio.playChime()
      setStatus('done')
      setToastOpen(true)

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => {
        setStatus('idle')
        setToastOpen(false)
        timerRef.current = null
      }, 3000)
    } catch (error) {
      console.error('[PDF Export] Failed to generate case study PDF:', error)
      setStatus('idle')
    }
  }, [dossier, project, status])

  const filename = `${project.slug || toSlug(project.title) || 'project'}-case-study.pdf`

  return (
    <>
      <motion.button
        type="button"
        onClick={handleDownloadPdf}
        disabled={status === 'generating'}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        aria-label={`Download ${project.title} case study PDF for offline reading`}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-wait ${
          status === 'done'
            ? 'border-accent/50 bg-overlay-medium text-accent'
            : 'border-line-subtle bg-surface/85 text-ink hover:border-line-medium hover:bg-surface hover:text-accent'
        }`}
      >
        {status === 'generating' ? (
          <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" aria-hidden="true" />
        ) : status === 'done' ? (
          <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        ) : (
          <FileDown className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        )}
        <span>
          {status === 'generating'
            ? 'Preparing PDF...'
            : status === 'done'
              ? 'PDF saved'
              : 'Download PDF'}
        </span>
      </motion.button>

      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
              {toastOpen && (
                <motion.div
                  key="pdf-downloaded-toast"
                  role="status"
                  aria-live="polite"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.24, ease: EASE_SETTLE }}
                  className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-line-medium bg-surface/95 px-4 py-3 text-xs text-ink shadow-xl backdrop-blur-xl"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <div className="space-y-0.5 pr-1">
                    <p className="font-semibold text-ink">Case study PDF downloaded</p>
                    <p className="text-[11px] font-mono text-muted">{filename}</p>
                  </div>
                  <button
                    type="button"
                    onClick={dismissToast}
                    aria-label="Dismiss notification"
                    className="rounded-full p-1 text-muted transition-colors hover:bg-overlay hover:text-ink cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </>
  )
}
