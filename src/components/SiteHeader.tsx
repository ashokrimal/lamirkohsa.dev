'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/media', label: 'Media' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-4 pt-4">
      <nav className="glass-nav mx-auto max-w-[1200px] rounded-sm" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between px-5 md:px-7">
          <Link href="/" className="font-semibold tracking-[-0.06em] text-[var(--ink)]" onClick={() => setIsOpen(false)}>
            Ashok Rimal<span className="text-[var(--accent)]">.</span>
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-[11px] uppercase tracking-[0.12em] transition-colors ${isCurrent(link.href) ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}>
                {link.label}
              </Link>
            ))}
          </div>
          <button type="button" className="text-[var(--ink)] lg:hidden" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="mobile-navigation" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}>
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>
      <div id="mobile-navigation" className={`mobile-menu fixed inset-y-0 right-0 z-40 w-[min(86vw,360px)] p-7 lg:hidden ${isOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-[-0.04em]">Navigation</span>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Close navigation menu"><X size={21} /></button>
        </div>
        <ul className="mt-20 space-y-7">
          {navLinks.map((link) => (
            <li key={link.href}><Link href={link.href} onClick={() => setIsOpen(false)} className={`block text-2xl tracking-[-0.04em] ${isCurrent(link.href) ? 'text-[var(--accent)]' : 'text-[var(--ink)]'}`}>{link.label}</Link></li>
          ))}
        </ul>
      </div>
    </header>
  );
}
