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
    <footer className="py-10 bg-gray-200">
      <div className="container mx-auto px-6 text-center text-gray-500">
        <div className="flex justify-center space-x-6 mb-6">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="text-gray-500 hover:text-black transition"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        <p>Exploring the intersection of design and technology.</p>
        <p>&copy; {year} Ashok Rimal. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
