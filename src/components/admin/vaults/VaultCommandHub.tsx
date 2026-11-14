import Link from 'next/link'
import {
  ArrowUpRight,
  BookOpen,
  Film,
  FolderKanban,
  Globe2,
  GraduationCap,
  Image as ImageIcon,
  Music2,
  type LucideIcon,
} from 'lucide-react'
import { VAULTS, VAULT_ROUTES, type VaultId } from '@/lib/admin-vaults'

const ICONS: Record<VaultId, LucideIcon> = {
  music: Music2,
  gallery: ImageIcon,
  media: Film,
  blogs: BookOpen,
  projects: FolderKanban,
  career: GraduationCap,
  meta: Globe2,
}

export default function VaultCommandHub({
  records,
}: {
  records: Array<{ collection: string; status: string }>
}) {
  const shortcuts = (Object.keys(VAULTS) as VaultId[]).map((id) => {
    const vault = VAULTS[id]
    const collections = new Set(vault.tabs.flatMap((tab) => tab.collections))
    const items = records.filter((record) => collections.has(record.collection))
    return {
      id,
      title: vault.title,
      label: vault.eyebrow,
      href: VAULT_ROUTES[id],
      icon: ICONS[id],
      total: items.length,
      drafts: items.filter((record) => record.status !== 'published').length,
    }
  })
  const totalDrafts = shortcuts.reduce((sum, item) => sum + item.drafts, 0)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Open a vault</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Each content domain has its own workspace, editor and publishing target.
          </p>
        </div>
        {totalDrafts > 0 ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
            {totalDrafts} draft{totalDrafts === 1 ? '' : 's'} awaiting review
          </span>
        ) : (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            All vaults synced
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        {shortcuts.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50/40 hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-teal-700 shadow-xs ring-1 ring-slate-100">
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-teal-600" />
              </div>
              <p className="mt-2 truncate text-[11px] font-semibold text-slate-800">{item.title}</p>
              <p className="mt-0.5 truncate text-[10px] text-slate-400">{item.label}</p>
              <div className="mt-2 flex items-center justify-between gap-1 text-[10px]">
                <span className="font-semibold tabular-nums text-slate-600">{item.total} items</span>
                {item.drafts > 0 && <span className="font-medium text-amber-700">{item.drafts} draft</span>}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
