'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

const groups = [
  { label: 'Workspace', links: [['Overview', '/admin'], ['Inbox', '/admin#inbox']] },
  { label: 'Portfolio', links: [['Profile & settings', '/admin#profile'], ['Projects', '/admin#projects'], ['Gallery', '/admin#gallery']] },
  { label: 'Media', links: [['Music', '/admin#music'], ['Movies', '/admin#movies'], ['Anime & manga', '/admin#anime']] },
]

export default function CmsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return <div className="cms-shell"><aside className="cms-sidebar"><a className="cms-brand" href="/admin"><span className="cms-brand-mark">A.</span><span><strong>Ashok Rimal</strong><small>Content management</small></span></a><nav className="cms-nav" aria-label="CMS navigation">{groups.map((group) => <div className="cms-nav-group" key={group.label}><p>{group.label}</p>{group.links.map(([label, href]) => <a className={pathname === href ? 'is-active' : ''} href={href} key={href}>{label}</a>)}</div>)}</nav><a className="cms-public-link" href="https://ashokrimal.com.np">Open public site ↗</a></aside><div className="cms-main"><header className="cms-mobile-bar"><a className="cms-brand" href="/admin"><span className="cms-brand-mark">A.</span><span><strong>CMS</strong><small>ashokrimal.com.np</small></span></a><button type="button" aria-label="Open CMS navigation" onClick={() => document.body.classList.toggle('cms-nav-open')}>Menu</button></header>{children}</div></div>
}
