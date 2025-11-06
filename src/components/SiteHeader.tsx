'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (!pathname) return false;
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed w-full z-30 top-0">
      <nav className="glass-nav mt-4 mx-4 md:mx-auto max-w-5xl rounded-lg">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-xl font-bold text-gray-800 hover:text-blue-600 transition tracking-tighter"
              onClick={() => setIsOpen(false)}
            >
              lamirkohsa
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isCurrent(link.href)
                      ? 'text-black font-semibold'
                      : 'text-gray-600 hover:text-black'
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <button
              type="button"
              className="md:hidden text-gray-800"
              onClick={() => setIsOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu fixed top-0 right-0 h-screen w-2/3 glass-nav p-5 md:hidden ${isOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="absolute top-6 right-5"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation menu"
        >
          <X size={24} />
        </button>
        <ul className="flex flex-col items-center justify-center h-full space-y-8 text-lg">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  `mobile-nav-link ${
                    isCurrent(link.href)
                      ? 'text-blue-600 font-bold'
                      : 'text-gray-800 hover:text-blue-600'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
