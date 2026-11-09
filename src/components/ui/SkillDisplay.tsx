import { Code2, Cpu, Database, Layout, Smartphone, Wrench } from 'lucide-react'

export interface SkillGroupData {
  category: string
  items: string[]
  level?: string
}

interface SkillDisplayProps {
  skills: SkillGroupData[]
  className?: string
  limit?: number
}

function getSkillIcon(category: string) {
  const c = category.toLowerCase()
  if (c.includes('front')) return Layout
  if (c.includes('back') || c.includes('api')) return Database
  if (c.includes('mobile')) return Smartphone
  if (c.includes('ai') || c.includes('robot')) return Cpu
  if (c.includes('tool') || c.includes('devops')) return Wrench
  return Code2
}

export function SkillDisplay({ skills, className = '', limit }: SkillDisplayProps) {
  const displaySkills = limit ? skills.slice(0, limit) : skills

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {displaySkills.map((group, index) => {
        const Icon = getSkillIcon(group.category)
        return (
          <article
            key={group.category || index}
            className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-5 flex flex-col justify-between hover:border-[var(--accent)] transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xs bg-[var(--paper)] text-[var(--accent)] border border-[var(--line)]">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--ink)]">
                    {group.category}
                  </h4>
                </div>
                {group.level && (
                  <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-xs bg-[var(--accent-soft)] text-[var(--accent)]">
                    {group.level}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-xs bg-[var(--paper)] border border-[var(--line)] px-2.5 py-1 text-[11px] font-mono text-[var(--ink)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
