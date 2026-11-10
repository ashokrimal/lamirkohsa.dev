import { Code2, Cpu, Database, Layout, Smartphone, Wrench } from 'lucide-react'
import { Card3D } from '@/components/ui/Card3D'

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
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
      {displaySkills.map((group, index) => {
        const Icon = getSkillIcon(group.category)
        return (
          <Card3D key={group.category || index} maxTilt={5}>
            <article className="apple-card p-6 flex flex-col justify-between h-full hover:border-black/10 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-black/[0.04] text-[#0071e3] border border-black/[0.04] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1d1d1f] tracking-tight">
                        {group.category}
                      </h4>
                      <span className="font-korean text-[10px] text-[#86868b] font-normal">
                        기술 영역
                      </span>
                    </div>
                  </div>
                  {group.level && (
                    <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-blue-500/10 text-[#0071e3]">
                      {group.level}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full bg-black/[0.04] border border-black/[0.03] px-3 py-1 text-xs font-medium text-[#424245]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Card3D>
        )
      })}
    </div>
  )
}
