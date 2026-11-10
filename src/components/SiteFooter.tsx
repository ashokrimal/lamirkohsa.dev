import Link from 'next/link'
import { ArrowUpRight, Github, Globe, Linkedin, Mail } from 'lucide-react'

const navigateLinks = [
  { href: '/', label: 'Home', kr: '홈' },
  { href: '/about', label: 'About', kr: '소개' },
  { href: '/projects', label: 'Projects', kr: '작업' },
  { href: '/media', label: 'Media', kr: '미디어' },
  { href: '/contact', label: 'Contact', kr: '연락처' },
]

const collectionLinks = [
  { href: '/blogs', label: 'Journal', kr: '글' },
  { href: '/gallery', label: 'Gallery', kr: '사진' },
  { href: '/media/music', label: 'Music archive', kr: '음악' },
  { href: '/media/anime', label: 'Anime library', kr: '애니' },
  { href: '/resume', label: 'Résumé', kr: '이력서' },
]

const socials = [
  { href: 'https://github.com/ashokrimal', label: 'GitHub', Icon: Github },
  { href: 'https://www.linkedin.com/in/lamirkohsa/', label: 'LinkedIn', Icon: Linkedin },
  { href: 'mailto:contact@lamirkohsa.com', label: 'Email', Icon: Mail },
  { href: 'https://ashokrimal.com.np', label: 'Domain', Icon: Globe },
]

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 md:mt-28 border-t border-line bg-surface">
      <div className="shell-width py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr] gap-10 md:gap-12">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-baseline gap-2 text-base font-semibold tracking-[-0.04em] text-ink hover:text-accent transition-colors"
            >
              Ashok Rimal<span className="text-accent">.</span>
              <span lang="ko" className="font-korean text-[11px] font-normal text-muted">
                아쇼크 리말
              </span>
            </Link>

            <p className="mt-3 text-sm text-muted leading-relaxed">
              Full-stack software developer building calm, human-centric interfaces and dependable
              backend systems from Nepal.
            </p>

            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="p-2 rounded-full border border-line-subtle bg-overlay text-muted hover:text-accent hover:border-line-medium transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <nav aria-label="Footer navigation">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Navigate
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navigateLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-baseline gap-1.5 text-ink-secondary hover:text-accent transition-colors"
                  >
                    <span>{link.label}</span>
                    <span lang="ko" className="font-korean text-[10px] text-muted">
                      {link.kr}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Collections */}
          <nav aria-label="Footer collections">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Collections
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {collectionLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-baseline gap-1.5 text-ink-secondary hover:text-accent transition-colors"
                  >
                    <span>{link.label}</span>
                    <span lang="ko" className="font-korean text-[10px] text-muted">
                      {link.kr}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact card */}
          <div>
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Elsewhere
            </h2>
            <div className="mt-4 apple-card p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
                Available for select work
              </p>
              <p className="mt-2 text-sm text-ink leading-relaxed">
                Software roles, independent builds and open-source collaborations.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                Start a conversation
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <div className="shell-width py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.12em] text-muted">
          <p>&copy; {year} Ashok Rimal</p>
          <p className="text-center">Canonical domain · ashokrimal.com.np</p>
          <Link href="#top" className="hover:text-accent transition-colors">
            Back to top ↑
          </Link>
        </div>
      </div>
    </footer>
  )
}
