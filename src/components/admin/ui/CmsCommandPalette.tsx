'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  LayoutDashboard,
  FileText,
  FolderKanban,
  Image,
  Music,
  Film,
  Inbox,
  Settings,
  Plus,
  ExternalLink,
  X,
  ArrowRight,
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (section: string) => void
  onQuickAction?: (action: string) => void
  recordsCount?: number
  galleryCount?: number
  musicCount?: number
}

export function CmsCommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onQuickAction,
  recordsCount = 0,
  galleryCount = 0,
  musicCount = 0,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // handled by parent or opened
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const navigationItems = [
    { id: 'overview', label: 'Workspace Overview', icon: LayoutDashboard, category: 'Navigation', hint: 'Metrics & activity' },
    { id: 'content', label: 'Content Collections', icon: FileText, category: 'Navigation', hint: `${recordsCount} records` },
    { id: 'projects', label: 'Projects Showcase', icon: FolderKanban, category: 'Navigation', hint: 'Featured work' },
    { id: 'gallery', label: 'Visual Gallery', icon: Image, category: 'Navigation', hint: `${galleryCount} artworks` },
    { id: 'uploads', label: 'Media Upload Center', icon: Image, category: 'Navigation', hint: 'File pipeline' },
    { id: 'music', label: 'Music Library', icon: Music, category: 'Navigation', hint: `${musicCount} tracks` },
    { id: 'catalog', label: 'Media Catalog', icon: Film, category: 'Navigation', hint: 'MAL & IMDb sync' },
    { id: 'inbox', label: 'Messages & Inquiries', icon: Inbox, category: 'Navigation', hint: 'Contact responses' },
    { id: 'settings', label: 'Profile & Integrations', icon: Settings, category: 'Settings', hint: 'API keys & usernames' },
  ]

  const quickActions = [
    { id: 'create-record', label: 'Create New CMS Record', icon: Plus, category: 'Quick Action' },
    { id: 'add-gallery', label: 'Upload Artwork to Gallery', icon: Plus, category: 'Quick Action' },
    { id: 'add-music', label: 'Add Track to Music Library', icon: Plus, category: 'Quick Action' },
    { id: 'view-site', label: 'Open Live Portfolio Site', icon: ExternalLink, category: 'External', externalUrl: 'https://ashokrimal.com.np' },
  ]

  const allItems = [...navigationItems, ...quickActions]

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          ('hint' in item && typeof item.hint === 'string' && item.hint.toLowerCase().includes(query.toLowerCase()))
      )
    : allItems

  const handleSelect = (item: (typeof allItems)[0]) => {
    if ('externalUrl' in item && item.externalUrl) {
      window.open(item.externalUrl, '_blank')
      onClose()
      return
    }
    if (item.category === 'Quick Action' && onQuickAction) {
      onQuickAction(item.id)
      onClose()
      return
    }
    onNavigate(item.id)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4"
    >
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95">
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search section, or action..."
            autoFocus
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands or sections found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-teal-900">
                        {item.label}
                      </p>
                      {'hint' in item && Boolean(item.hint) && (
                        <p className="text-[11px] text-slate-400">{(item as any).hint}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white px-1 rounded border border-slate-200">↵</kbd> select
            </span>
            <span>
              <kbd className="font-mono bg-white px-1 rounded border border-slate-200">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
