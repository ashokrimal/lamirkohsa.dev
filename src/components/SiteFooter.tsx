import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail, Globe } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/media', label: 'Media' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
];

const socials = [
  { href: 'https://github.com/ashokrimal', label: 'GitHub', Icon: Github },
  { href: 'https://www.linkedin.com/in/lamirkohsa/', label: 'LinkedIn', Icon: Linkedin },
  { href: 'mailto:contact@lamirkohsa.com', label: 'Email', Icon: Mail },
  { href: 'https://ashokrimal.com.np', label: 'Domain', Icon: Globe },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] mt-24 py-12">
      <div className="shell-width flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <Link href="/" className="font-semibold tracking-[-0.05em] text-sm text-[var(--ink)]">
            Ashok Rimal<span className="text-[var(--accent)]">.</span>
          </Link>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Full-stack software developer · Calm, human-centric interfaces
          </p>
        </div>

        <nav className="flex items-center gap-5 text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[var(--accent)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="p-2 rounded-xs border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </div>

      <div className="shell-width mt-6 pt-6 border-t border-[var(--line)]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[var(--muted)]">
        <p>&copy; {year} Ashok Rimal. All rights reserved.</p>
        <p>Canonical domain: https://ashokrimal.com.np</p>
      </div>
    </footer>
  );
}
