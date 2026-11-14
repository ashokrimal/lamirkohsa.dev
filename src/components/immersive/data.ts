export interface ImmersiveProject {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  stack: string[];
  description: string;
  accent: string;
  href: string;
}

export const IMMERSIVE_PROJECTS: ImmersiveProject[] = [
  {
    id: 'kharcha',
    index: '01',
    title: 'Kharcha',
    subtitle: 'Money, made legible.',
    category: 'Fintech / Product',
    year: '2025',
    stack: ['Next.js', 'PostgreSQL', 'Tailwind'],
    description:
      'A personal finance workspace that turns everyday spending into a clear, calm picture. Built for fast entry, useful summaries, and less friction around money.',
    accent: '#5eead4',
    href: '/projects',
  },
  {
    id: 'kollywood-vault',
    index: '02',
    title: 'Kollywood Vault',
    subtitle: 'A home for Nepali cinema.',
    category: 'Culture / Discovery',
    year: '2025',
    stack: ['React', 'Three.js', 'TMDB'],
    description:
      'A living archive for Nepali cinema — films, people, and stories collected in one cinematic, explorable place. Designed to make discovery feel as dramatic as the screen.',
    accent: '#c8ff72',
    href: '/projects',
  },
];

export const IMMERSIVE_CHAPTERS = ['ENTRY', 'SELECTED WORK', 'STUDIO', 'TOOLKIT', 'SIGNAL'] as const;
