'use client';

import { useEffect } from 'react';

export default function ScrollObserver() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.fade-in-up'));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
