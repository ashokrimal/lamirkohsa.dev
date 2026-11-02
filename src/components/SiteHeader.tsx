'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/projects', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  return <header className="fixed left-0 right-0 top-0 z-30"><nav className="mx-auto flex w-[min(1120px,calc(100%-34px))] items-center justify-between border-b border-[#303332] py-5"><Link href="/" className="text-sm font-semibold tracking-[.16em] text-[#f2f1ed]" onClick={() => setIsOpen(false)}>ASHOK<span className="text-[#b9e769]">.</span></Link><div className="hidden items-center gap-8 md:flex">{navLinks.map((link) => <Link key={link.href} href={link.href} className={`text-[11px] uppercase tracking-[.16em] transition-colors ${pathname?.startsWith(link.href) ? 'text-[#b9e769]' : 'text-[#898c87] hover:text-[#f2f1ed]'}`}>{link.label}</Link>)}<Link href="/contact" className="rounded-full border border-[#b9e769] px-4 py-2 text-[10px] uppercase tracking-[.14em] text-[#b9e769] transition hover:bg-[#b9e769] hover:text-[#151711]">Say hello</Link></div><button type="button" className="text-[#f2f1ed] md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation menu">{isOpen ? <X size={21} /> : <Menu size={21} />}</button></nav>{isOpen && <div className="absolute left-0 right-0 top-[68px] border-b border-[#303332] bg-[#101112] px-[17px] py-6 md:hidden"><div className="flex flex-col gap-5">{navLinks.map((link) => <Link key={link.href} href={link.href} className="text-sm uppercase tracking-[.16em] text-[#a4a5a1]" onClick={() => setIsOpen(false)}>{link.label}</Link>)}</div></div>}</header>;
}
