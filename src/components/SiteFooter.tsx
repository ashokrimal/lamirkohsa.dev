import { Github, Linkedin, Twitter, Instagram } from 'lucide-react';

const socials = [
  { href: 'https://github.com/ashokrimal', label: 'GitHub', Icon: Github },
  { href: 'https://www.linkedin.com/in/lamirkohsa/', label: 'LinkedIn', Icon: Linkedin },
  { href: 'https://twitter.com/lamirkohsa', label: 'Twitter/X', Icon: Twitter },
  { href: 'https://www.instagram.com/lamirkohsa/', label: 'Instagram', Icon: Instagram },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-socials">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="site-footer-link"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        <p className="site-footer-note">Exploring the intersection of design and technology.</p>
        <p className="site-footer-note">&copy; {year} Ashok Rimal. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
