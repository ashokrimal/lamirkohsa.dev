import type { Metadata } from 'next';
import Image from 'next/image';
import ScrollObserver from '@/components/ScrollObserver';

const skillSections = [
  {
    title: 'Frontend Development',
    items: [
      { label: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
      { label: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
      { label: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { label: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { label: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
    ],
  },
  {
    title: 'Backend & Databases',
    items: [
      { label: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { label: 'Express.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
      { label: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
    ],
  },
  {
    title: 'Design & Developer Tools',
    items: [
      { label: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
      { label: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
      { label: 'Figma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
      { label: 'VS Code', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
    ],
  },
];

export const metadata: Metadata = {
  title: 'Skills - Ashok Rimal',
  description: 'The technologies and tools Ashok Rimal uses to build digital experiences.',
};

export default function SkillsPage() {
  return (
    <div className="py-20 md:py-32">
      <ScrollObserver />
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900">My Toolkit.</h1>
          <p className="text-lg text-gray-500 mt-4">The technologies and tools I use to bring ideas to life.</p>
        </div>

        <div className="space-y-16 max-w-5xl mx-auto">
          {skillSections.map((section, sectionIndex) => (
            <section key={section.title} className="fade-in-up" style={{ transitionDelay: `${sectionIndex * 150}ms` }}>
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{section.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {section.items.map(item => (
                  <div key={item.label} className="skill-card text-center p-6 rounded-2xl">
                    <Image src={item.icon} alt={item.label} width={48} height={48} className="h-12 w-12 mx-auto mb-3" />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
