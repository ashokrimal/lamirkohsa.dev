export const profile = {
  name: 'Ashok Rimal',
  headline: 'Developer · Designer · Learner',
  location: 'Butwal, Nepal',
  summary: 'A Bachelor of Computer Applications student and developer focused on thoughtful interfaces, useful products, and the details that make software feel human.',
};

export const experience = [
  { period: 'March 2024 - August 2024', title: 'AI and Robotics Instructor', organization: 'Dursikshya Education', description: 'Teaching students to turn curiosity into practical experiments across AI, robotics, and creative technology.' },
];

export const education = [
  { period: 'August 2022 - Present', title: 'Bachelor of Computer Applications', organization: 'Crimson College of Technology', description: 'An affiliated college of Pokhara University.' },
  { period: 'July 2020 - June 2022', title: '+2', organization: 'Tilottama College', description: 'Higher secondary education.' },
  { period: 'April 2018 - March 2020', title: 'Secondary Education', organization: 'Rampur English Boarding Secondary School', description: 'Secondary school education.' },
];

export const skills = [
  { category: 'Frontend Development', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
  { category: 'Backend Development', items: ['Node.js', 'Express', 'REST APIs'] },
  { category: 'Programming Languages', items: ['TypeScript', 'JavaScript', 'Python'] },
  { category: 'Database', items: ['PostgreSQL', 'Firebase'] },
  { category: 'Mobile Development', items: ['React Native'] },
  { category: 'AI and Emerging Technologies', items: ['AI / ML', 'Robotics'] },
  { category: 'UI/UX', items: ['Product design', 'Accessible interfaces'] },
  { category: 'Tools and Technologies', items: ['Git', 'Figma', 'REST'] },
  { category: 'Soft Skills', items: ['Communication', 'Teaching', 'Problem solving'] },
];

export const projects = [
  { title: 'KaryaMantra', category: 'Productivity platform', description: 'A calm workspace that helps students turn scattered assignments into steady progress.', tags: ['React', 'Firebase'], status: 'Prototype' },
  { title: 'BuyNepal', category: 'E-commerce experience', description: 'A marketplace concept connecting local makers with a simpler, more human storefront.', tags: ['Next.js', 'Node.js'], status: 'Concept' },
  { title: 'InsightHub', category: 'Knowledge platform', description: 'A collaborative data exchange for teams that want to make more value from what they know.', tags: ['React Native', 'Express'], status: 'Ongoing' },
];

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/ashokrimal' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/ashokrimal' },
  { label: 'Email', href: 'mailto:hello@ashokrimal.com.np' },
];

export const blogs = [
  {
    id: 1,
    title: 'Building Calm Interfaces in a Noisy Web',
    slug: 'building-calm-interfaces-in-a-noisy-web',
    date: 'October 2024',
    category: 'Design Engineering',
    description:
      'Most modern digital software bombards users with notifications, saturated gradients, modal dialogs, and simulated urgency. Over the past year of designing and shipping products, I have converged on an opposing philosophy: calm software that respects human cognitive bandwidth. Calm interfaces avoid unnecessary motion, prioritize generous whitespace, and use progressive disclosure to reveal complexity only when invited. In this essay, we break down typography hierarchy, restrained color palettes, and why quiet software always outlasts noisy gimmicks.',
  },
  {
    id: 2,
    title: 'Reflections on Teaching Robotics & Python to College Beginners',
    slug: 'reflections-on-teaching-robotics-python',
    date: 'August 2024',
    category: 'Teaching & Pedagogy',
    description:
      'Teaching at Dursikshya Education forced me to re-evaluate how beginners conceptualize abstract programming constructs. When a student sees an error in a terminal, it feels like an impenetrable wall. But when an Arduino motor fails to spin because a PWM signal is out of bounds, the bug is immediately tactile and physical. Connecting hardware feedback loops to Python logic completely transformed how students engaged with loops, conditionals, and state machines. Here are the core pedagogical patterns that worked best.',
  },
  {
    id: 3,
    title: 'The Architecture of Offline-First Web Applications',
    slug: 'architecture-of-offline-first-web-applications',
    date: 'June 2024',
    category: 'Full-Stack Architecture',
    description:
      'Building web applications for regions with intermittent bandwidth requires discarding the assumption that the network is always reliable. By combining IndexedDB local caching, service worker background synchronization, and optimistic UI updates, developers can craft experiences that never freeze or lose unsaved edits. We examine conflict resolution strategies, monotonic timestamp ordering, and how to design UI states that reassure users while background sync queues reconnect.',
  },
  {
    id: 4,
    title: 'Why Small, Focused Tools Matter',
    slug: 'why-small-focused-tools-matter',
    date: 'May 2024',
    category: 'Philosophy',
    description:
      'The tendency of modern software products is toward feature sprawl. Every tool attempts to become an all-in-one operating system. Yet the utilities developers cherish most are Unix-style single-purpose programs that perform one task exceptionally well and compose cleanly with others.',
  },
];

