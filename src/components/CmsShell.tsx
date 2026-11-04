'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

const groups = [
  { label: 'Workspace', links: [['Overview', '/admin'], ['Content collections', '/admin?section=content']] },
  { label: 'Portfolio', links: [['Profile & settings', '/admin?section=settings'], ['Gallery', '/admin?section=gallery'], ['Upload center', '/admin?section=uploads']] },
  { label: 'Media', links: [['Music', '/admin?section=music'], ['Movies & catalog', '/admin?section=catalog']] },
]

export default function CmsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return <div className="cms-shell"><aside className="cms-sidebar"><a className="cms-brand" href="/admin"><span className="cms-brand-mark">A.</span><span><strong>Ashok Rimal</strong><small>Content management</small></span></a><nav className="cms-nav" aria-label="CMS navigation">{groups.map((group) => <div className="cms-nav-group" key={group.label}><p>{group.label}</p>{group.links.map(([label, href]) => <a className={pathname === href ? 'is-active' : ''} href={href} key={href}>{label}</a>)}</div>)}</nav><a className="cms-public-link" href="https://ashokrimal.com.np">Open public site ↗</a></aside><div className="cms-main"><header className="cms-mobile-bar"><a className="cms-brand" href="/admin"><span className="cms-brand-mark">A.</span><span><strong>CMS</strong><small>ashokrimal.com.np</small></span></a><button type="button" aria-label="Open CMS navigation" onClick={() => document.body.classList.toggle('cms-nav-open')}>Menu</button></header><header className="cms-topbar"><div><span className="cms-breadcrumb">Workspace / Overview</span><strong>Content studio</strong></div><div className="cms-topbar-actions"><span className="cms-live-status"><i /> Live site connected</span><a href="https://ashokrimal.com.np">Preview ↗</a></div></header>{children}</div></div>
}
