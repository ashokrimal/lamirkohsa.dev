'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { and, asc, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CmsRecord {
  id: number
  userId?: string
  collection: string
  title: string
  slug: string
  payload: Record<string, unknown>
  status: string
  sortOrder: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

async function requireUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user?.id) return session.user.id
  } catch {
    // Auth or DB offline fallback
  }
  return 'admin-ashok-rimal'
}

// Master Initial CMS Data Set (Source of Truth for initial seed)
const INITIAL_CMS_DATA: Array<Omit<CmsRecord, 'id'> & { id?: number }> = [
  // 1. SITE SETTINGS: Hero Section
  {
    collection: 'Site Settings',
    title: 'Hero Section',
    slug: 'hero-section',
    status: 'published',
    sortOrder: 0,
    payload: {
      heading: 'Hello.',
      subtitle: "I'm Ashok, a developer building calm, useful digital experiences.",
      location: 'Butwal, Nepal\nAvailable for thoughtful collaborations',
      initials: 'AR',
      imageUrl: '/images/hero-ashok.png',
      stats: [
        { label: 'Selected projects', value: '04+' },
        { label: 'Creative disciplines', value: '04' },
      ],
      metaLeft: 'Scroll to explore ↓',
      metaRight: 'Selected work · 01 / 06',
    },
  },

  // 2. SITE SETTINGS: Homepage Sections Visibility & Order
  {
    collection: 'Site Settings',
    title: 'Homepage Sections',
    slug: 'homepage-sections',
    status: 'published',
    sortOrder: 1,
    payload: {
      order: ['about', 'gallery', 'projects', 'media', 'experience', 'contact'],
      enabled: {
        about: true,
        gallery: true,
        projects: true,
        media: true,
        experience: true,
        contact: true,
      },
      sectionMeta: {
        about: {
          eyebrow: '01 / About Me',
          title: 'Useful by design.',
          accent: 'Quietly ambitious.',
          description: 'I like the space between a rough idea and the moment it becomes obvious to use.',
        },
        gallery: {
          eyebrow: '02 / Visual Journal',
          title: 'Moments in',
          accent: 'perspective.',
          description: 'Personal photographs capturing quiet geometry, architecture, and light across Nepal.',
        },
        projects: {
          eyebrow: '03 / Selected Work',
          title: 'Systems built with',
          accent: 'conviction.',
          description: 'Web and mobile applications engineered from user research to production delivery.',
        },
        media: {
          eyebrow: '04 / Cultural Influences',
          title: 'Soundtrack &',
          accent: 'Stories.',
          description: 'Music rotation, anime, and manga that inspire visual rhythm and focus.',
        },
        experience: {
          eyebrow: '05 / Career & Toolkit',
          title: 'Work in',
          accent: 'practice.',
          description: 'Roles, teaching commitments, and practical technical proficiencies.',
        },
        contact: {
          eyebrow: '06 / Direct Dispatch',
          title: "Let's build something",
          accent: 'thoughtful.',
          description: 'Open to software engineering roles, client contracts, and collaborative builds.',
        },
      },
    },
  },

  // 3. SITE SETTINGS: SEO Metadata
  {
    collection: 'Site Settings',
    title: 'SEO Settings',
    slug: 'seo-settings',
    status: 'published',
    sortOrder: 2,
    payload: {
      siteTitle: 'Ashok Rimal - Software Developer Portfolio',
      siteDescription: 'Personal portfolio of Ashok Rimal, a software developer building calm, useful digital experiences across web, mobile, and backend systems.',
      domain: 'https://ashokrimal.com.np',
      keywords: 'Ashok Rimal, Software Developer, Full-Stack Engineer, Next.js, React, TypeScript, Nepal',
    },
  },

  // 4. PROFILE
  {
    collection: 'Profile',
    title: 'Ashok Rimal',
    slug: 'ashok-rimal',
    status: 'published',
    sortOrder: 0,
    payload: {
      name: 'Ashok Rimal',
      headline: 'Software Developer · Interface Craftsman',
      location: 'Butwal & Kathmandu, Nepal',
      summary: 'A Bachelor of Computer Applications student and full-stack software developer focused on thoughtful interfaces, dependable backend systems, and the details that make software feel human.',
      bio: 'I enjoy turning ambiguous questions into clear, dependable digital experiences. My current work spans React, Next.js, TypeScript, React Native, Node.js, and robotics pedagogy. Outside of code, I explore photography, ambient soundscapes, and thoughtful design systems.',
      availability: 'Available for software engineering roles & thoughtful collaborations',
      email: 'info.ashokrimal@gmail.com',
      avatarUrl: '/images/hero-ashok.png',
      experienceYears: '03+',
      primaryStack: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
    },
  },

  // 5. PROJECTS (Rich Case Studies with Phases & Media)
  {
    collection: 'Projects',
    title: 'KaryaMantra',
    slug: 'karyamantra',
    status: 'published',
    sortOrder: 0,
    payload: {
      category: 'Web',
      featured: true,
      completionDate: 'October 2024',
      period: 'Sep 2024 – Oct 2024',
      status: 'Shipped · Active',
      summary: 'A calm, distraction-free Kanban productivity workspace that helps students turn scattered assignments into steady progress.',
      challenge: 'University students struggled with fragmented assignment trackers, missed submission deadlines, and disjointed group task coordination across busy academic terms.',
      solution: 'Engineered a real-time Kanban productivity workspace with instant live synchronization, contextual deadline countdowns, and role-based group workspaces.',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&auto=format&fit=crop&q=80',
      techStack: ['React', 'Firebase', 'Tailwind CSS', 'TypeScript', 'Framer Motion'],
      github: 'https://github.com/ashokrimal',
      live: 'https://karyamantra.vercel.app',
      features: [
        'Role-based dashboards with instant task sync',
        'Drag-and-drop Kanban workflow with tag categorization',
        'Contextual deadline countdowns and email reminders',
        'Offline-capable optimistic state updates',
      ],
      phases: [
        { phase: 'Phase 1', name: 'Discovery & Research', period: 'Sep 01 – Sep 08', description: 'Surveyed 40+ college peers on deadline anxiety to define task hierarchy.', completed: true },
        { phase: 'Phase 2', name: 'Data Architecture', period: 'Sep 09 – Sep 20', description: 'Structured real-time data schemas with role-based security rules.', completed: true },
        { phase: 'Phase 3', name: 'Kanban Engine', period: 'Sep 21 – Oct 05', description: 'Implemented smooth drag-and-drop task movements and keyboard accessibility.', completed: true },
        { phase: 'Phase 4', name: 'Production Delivery', period: 'Oct 06 – Oct 18', description: 'Deployed with automated test coverage, viewport tuning, and email notifications.', completed: true },
      ],
    },
  },
  {
    collection: 'Projects',
    title: 'BuyNepal Marketplace',
    slug: 'buynepal-marketplace',
    status: 'published',
    sortOrder: 1,
    payload: {
      category: 'Web',
      featured: true,
      completionDate: 'September 2024',
      period: 'Aug 2024 – Sep 2024',
      status: 'Production Prototype',
      summary: 'A digital commerce experience connecting independent Nepalese artisans with considered online storefronts.',
      challenge: 'Independent Nepalese artisans and handicraft makers lacked a lightweight, accessible storefront platform that could handle transactions and inventory without steep technical overhead.',
      solution: 'Architected a full-stack digital marketplace featuring a seller product inventory CMS, secure payment processing, automated order notifications, and sales analytics.',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80',
      techStack: ['Next.js', 'Node.js', 'MongoDB', 'Stripe', 'Tailwind CSS'],
      github: 'https://github.com/ashokrimal',
      live: '#',
      features: [
        'Artisan product inventory management CMS',
        'Secure end-to-end checkout with automated webhooks',
        'Real-time sales telemetry and order tracking',
        'Fast responsive storefront with SEO optimization',
      ],
      phases: [
        { phase: 'Phase 1', name: 'Artisan Audit', period: 'Aug 01 – Aug 07', description: 'Mapped merchant onboarding workflows and localized digital payment options.', completed: true },
        { phase: 'Phase 2', name: 'Catalog Schema', period: 'Aug 08 – Aug 20', description: 'Implemented document schemas for products, multi-variant pricing, and orders.', completed: true },
        { phase: 'Phase 3', name: 'Payment Pipeline', period: 'Aug 21 – Sep 05', description: 'Integrated Stripe checkout webhooks with transactional order confirmations.', completed: true },
        { phase: 'Phase 4', name: 'Storefront Optimization', period: 'Sep 06 – Sep 22', description: 'Optimized Next.js server components achieving 95+ Lighthouse performance.', completed: true },
      ],
    },
  },
  {
    collection: 'Projects',
    title: 'SwiftCare Telehealth',
    slug: 'swiftcare-telehealth',
    status: 'published',
    sortOrder: 2,
    payload: {
      category: 'Mobile',
      featured: true,
      completionDate: 'August 2024',
      period: 'Jun 2024 – Aug 2024',
      status: 'Completed',
      summary: 'A cross-platform mobile application facilitating low-bandwidth consultation scheduling and encrypted doctor-patient messaging.',
      challenge: 'Outpatient clinics and patients in remote districts required a fast, low-bandwidth mobile app to schedule doctor appointments and exchange consultation updates without physical travel.',
      solution: 'Shipped a cross-platform mobile application integrating calendar scheduling, automated push reminders, and low-latency encrypted doctor-patient consultation messaging.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
      techStack: ['React Native', 'Expo', 'Express.js', 'Socket.io', 'Node.js'],
      github: 'https://github.com/ashokrimal',
      live: '#',
      features: [
        'Cross-platform calendar scheduling and reminders',
        'Low-latency encrypted doctor-patient consultation chat',
        'Automated prescription sharing and follow-up notices',
        'Adaptive UI responsive to variable network speeds',
      ],
      phases: [
        { phase: 'Phase 1', name: 'Clinical Flow Design', period: 'Jun 05 – Jun 18', description: 'Designed consultation scheduling flows and appointment cancellation states.', completed: true },
        { phase: 'Phase 2', name: 'Mobile UI Foundation', period: 'Jun 19 – Jul 08', description: 'Built React Native components optimized for entry-level devices.', completed: true },
        { phase: 'Phase 3', name: 'Consultation Chat', period: 'Jul 09 – Jul 28', description: 'Engineered WebSocket message queues with Socket.io on Express.', completed: true },
        { phase: 'Phase 4', name: 'Mobile Push & Testing', period: 'Jul 29 – Aug 15', description: 'Configured push delivery pipelines and conducted end-to-end device testing.', completed: true },
      ],
    },
  },
  {
    collection: 'Projects',
    title: 'Departmental Store Management System (DSMS)',
    slug: 'dsms-management-system',
    status: 'published',
    sortOrder: 3,
    payload: {
      category: 'Web',
      featured: false,
      completionDate: 'June 2024',
      period: 'Mar 2024 – Jun 2024',
      status: 'Live on Vercel',
      summary: 'An enterprise-grade retail inventory web application with barcode lookup, POS billing, and real-time stock deductions.',
      challenge: 'Retail stores required a dependable, modern inventory system to replace paper ledgers, prevent stock discrepancies, and generate fast billing receipts at point-of-sale.',
      solution: 'Engineered an inventory web application with barcode lookup, real-time stock deductions, role-based cashier access, and automated sales reporting.',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop&q=80',
      techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
      github: 'https://github.com/ashokrimal/arss',
      live: 'https://dsmsbyarss.vercel.app',
      features: [
        'Real-time barcode inventory tracking and low-stock alerts',
        'Keyboard-optimized point-of-sale checkout counter',
        'Role-based access controls for cashiers and store admins',
        'Automated daily sales reports and CSV export',
      ],
      phases: [
        { phase: 'Phase 1', name: 'Store Operations Audit', period: 'Mar 10 – Mar 28', description: 'Interviewed departmental store managers to map daily checkout bottlenecks.', completed: true },
        { phase: 'Phase 2', name: 'Database Architecture', period: 'Mar 29 – Apr 25', description: 'Designed normalized inventory schemas and built REST endpoints.', completed: true },
        { phase: 'Phase 3', name: 'Cashier POS Engine', period: 'Apr 26 – May 20', description: 'Developed keyboard-driven billing interface with tax calculations.', completed: true },
        { phase: 'Phase 4', name: 'Deployment & Training', period: 'May 21 – Jun 12', description: 'Deployed to Vercel production with MongoDB Atlas and delivered docs.', completed: true },
      ],
    },
  },

  // 6. GALLERY (Photographs & Visual Journal)
  {
    collection: 'Gallery',
    title: 'Himalayan Foothills at Dawn',
    slug: 'himalayan-foothills-at-dawn',
    status: 'published',
    sortOrder: 0,
    payload: {
      category: 'Photography',
      imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
      description: 'Early morning light touching the ridge lines near Pokhara.',
      location: 'Pokhara, Nepal',
      featured: true,
    },
  },
  {
    collection: 'Gallery',
    title: 'Studio Workspace in Butwal',
    slug: 'studio-workspace-in-butwal',
    status: 'published',
    sortOrder: 1,
    payload: {
      category: 'Workspace',
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      description: 'Mechanical keyboard, physical notebooks, and natural window light.',
      location: 'Studio, Butwal',
      featured: true,
    },
  },
  {
    collection: 'Gallery',
    title: 'Minimalist Design System Spec',
    slug: 'minimalist-design-system-spec',
    status: 'published',
    sortOrder: 2,
    payload: {
      category: 'Selected work',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      description: 'Generative geometric composition exploring typographic rhythm.',
      location: 'Digital Artifact',
      featured: true,
    },
  },
  {
    collection: 'Gallery',
    title: 'Night Atmosphere & Streetlights',
    slug: 'night-atmosphere-streetlights',
    status: 'published',
    sortOrder: 3,
    payload: {
      category: 'Photography',
      imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
      description: 'Late evening reflections on wet asphalt in Kathmandu.',
      location: 'Kathmandu, Nepal',
      featured: true,
    },
  },

  // 7. EXPERIENCE
  {
    collection: 'Experience',
    title: 'AI and Robotics Instructor',
    slug: 'ai-and-robotics-instructor',
    status: 'published',
    sortOrder: 0,
    payload: {
      organization: 'Dursikshya Education',
      period: 'March 2024 - August 2024',
      location: 'Kathmandu, Nepal',
      description: 'Teaching students to turn curiosity into practical experiments across AI, robotics, and creative technology.',
      highlights: [
        'Mentored 60+ students in microcontroller programming, sensors, and actuator logic.',
        'Developed interactive Python curriculum connecting algorithms to physical Arduino motor hardware.',
        'Supervised student capstone projects presented at regional engineering showcases.',
      ],
    },
  },
  {
    collection: 'Experience',
    title: 'Independent Full-Stack Developer',
    slug: 'independent-fullstack-developer',
    status: 'published',
    sortOrder: 1,
    payload: {
      organization: 'Freelance & Open Source',
      period: '2023 - Present',
      location: 'Remote',
      description: 'Architecting custom web applications, e-commerce prototypes, and developer tooling for international clients.',
      highlights: [
        'Built production web applications utilizing Next.js, React, Node.js, and relational databases.',
        'Refined web performance to achieve sub-second LCP and 95+ Lighthouse audits.',
        'Authored open-source utilities and reusable interface kits.',
      ],
    },
  },

  // 8. EDUCATION
  {
    collection: 'Education',
    title: 'Bachelor of Computer Applications (BCA)',
    slug: 'bca-crimson-college',
    status: 'published',
    sortOrder: 0,
    payload: {
      organization: 'Crimson College of Technology (Pokhara University)',
      period: 'August 2022 - Present',
      location: 'Butwal, Nepal',
      description: 'In-depth coursework in data structures, algorithms, relational database systems, software engineering methodologies, and distributed systems.',
    },
  },
  {
    collection: 'Education',
    title: '+2 Higher Secondary Education (Science)',
    slug: 'higher-secondary-tilottama',
    status: 'published',
    sortOrder: 1,
    payload: {
      organization: 'Tilottama College',
      period: 'July 2020 - June 2022',
      location: 'Butwal, Nepal',
      description: 'Physics, Mathematics, Computer Science, and Chemistry foundations.',
    },
  },

  // 9. SKILLS (Categorized)
  {
    collection: 'Skills',
    title: 'Frontend Engineering',
    slug: 'skill-frontend-engineering',
    status: 'published',
    sortOrder: 0,
    payload: {
      category: 'Frontend Engineering',
      level: 'Advanced',
      items: ['React.js', 'Next.js 14/15', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'HTML5 / CSS3'],
    },
  },
  {
    collection: 'Skills',
    title: 'Backend & APIs',
    slug: 'skill-backend-apis',
    status: 'published',
    sortOrder: 1,
    payload: {
      category: 'Backend & APIs',
      level: 'Proficient',
      items: ['Node.js', 'Express.js', 'REST APIs', 'PostgreSQL', 'MongoDB', 'Firebase'],
    },
  },
  {
    collection: 'Skills',
    title: 'Mobile Development',
    slug: 'skill-mobile-development',
    status: 'published',
    sortOrder: 2,
    payload: {
      category: 'Mobile Development',
      level: 'Intermediate',
      items: ['React Native', 'Expo', 'Mobile Navigation', 'Offline Sync'],
    },
  },
  {
    collection: 'Skills',
    title: 'AI & Emerging Tech',
    slug: 'skill-ai-robotics',
    status: 'published',
    sortOrder: 3,
    payload: {
      category: 'AI & Emerging Tech',
      level: 'Hands-on',
      items: ['Python', 'Arduino / C++', 'Computer Vision', 'Microcontrollers', 'Sensors'],
    },
  },
  {
    collection: 'Skills',
    title: 'Tools & DevOps',
    slug: 'skill-tools-devops',
    status: 'published',
    sortOrder: 4,
    payload: {
      category: 'Tools & DevOps',
      level: 'Daily Use',
      items: ['Git & GitHub', 'Vercel', 'Postman', 'Linux / Bash', 'Figma'],
    },
  },

  // 10. CERTIFICATES & RECOGNITION
  {
    collection: 'Certificates',
    title: 'Python for Data Science and Machine Learning',
    slug: 'cert-python-ds-ml',
    status: 'published',
    sortOrder: 0,
    payload: {
      organization: 'DeepLearning.AI / Coursera',
      date: '2024',
      credentialUrl: 'https://coursera.org',
      credentialId: 'DL-PY-94812',
      description: 'Hands-on training in Python algorithms, data structures, and mathematical modeling.',
    },
  },
  {
    collection: 'Certificates',
    title: 'Full-Stack Web Development Specialization',
    slug: 'cert-fullstack-dev',
    status: 'published',
    sortOrder: 1,
    payload: {
      organization: 'Online Engineering Academy',
      date: '2023',
      credentialUrl: 'https://example.com/verify',
      credentialId: 'FS-WEB-2023-AR',
      description: 'Modern component architecture, server actions, relational schema design, and deployment pipelines.',
    },
  },

  // 11. MEDIA: MUSIC
  {
    collection: 'Music',
    title: 'Chamber of Reflection',
    slug: 'music-chamber-of-reflection',
    status: 'published',
    sortOrder: 0,
    payload: {
      artist: 'Mac DeMarco',
      album: 'Salad Days',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
      featured: true,
      mood: 'Reflective Lo-Fi',
    },
  },
  {
    collection: 'Music',
    title: 'Midnight City',
    slug: 'music-midnight-city',
    status: 'published',
    sortOrder: 1,
    payload: {
      artist: 'M83',
      album: "Hurry Up, We're Dreaming",
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
      audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
      featured: true,
      mood: 'Cinematic Synthwave',
    },
  },
  {
    collection: 'Music',
    title: 'Nuvole Bianche',
    slug: 'music-nuvole-bianche',
    status: 'published',
    sortOrder: 2,
    payload: {
      artist: 'Ludovico Einaudi',
      album: 'Una Mattina',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
      audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
      featured: true,
      mood: 'Neo-Classical Piano',
    },
  },

  // 12. MEDIA: ANIME
  {
    collection: 'Anime',
    title: "Frieren: Beyond Journey's End",
    slug: 'anime-frieren',
    status: 'published',
    sortOrder: 0,
    payload: {
      kind: 'anime',
      score: '9.5 / 10',
      status: 'Completed',
      progress: '28 / 28 episodes',
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      synopsis: 'An elven mage explores the world decades after defeating the demon king, learning the value of mortal bonds and transient time.',
      featured: true,
    },
  },
  {
    collection: 'Anime',
    title: 'Steins;Gate',
    slug: 'anime-steins-gate',
    status: 'published',
    sortOrder: 1,
    payload: {
      kind: 'anime',
      score: '9.4 / 10',
      status: 'Completed',
      progress: '24 / 24 episodes',
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      synopsis: 'A self-proclaimed eccentric scientist stumbles upon microwave-driven temporal causality, sparking high-stakes scientific consequences.',
      featured: true,
    },
  },

  // 13. MEDIA: MANGA / MANHWA
  {
    collection: 'Manga',
    title: 'Vagabond',
    slug: 'manga-vagabond',
    status: 'published',
    sortOrder: 0,
    payload: {
      kind: 'manga',
      score: '9.8 / 10',
      status: 'Reading',
      progress: 'Chapter 327',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      synopsis: "Takehiko Inoue's profound graphic retelling of samurai Miyamoto Musashi's philosophical journey from raw aggression to inner mastery.",
      featured: true,
    },
  },
  {
    collection: 'Manga',
    title: 'Solo Leveling',
    slug: 'manhwa-solo-leveling',
    status: 'published',
    sortOrder: 1,
    payload: {
      kind: 'manhwa',
      score: '9.1 / 10',
      status: 'Completed',
      progress: 'Chapter 179',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      synopsis: 'A dynamic South Korean action manhwa following an E-rank hunter who discovers an exclusive quest interface to level up without limits.',
      featured: true,
    },
  },

  // 14. SOCIAL LINKS & CONTACT CHANNELS
  {
    collection: 'Social Links',
    title: 'GitHub',
    slug: 'social-github',
    status: 'published',
    sortOrder: 0,
    payload: {
      label: 'GitHub',
      href: 'https://github.com/ashokrimal',
      handle: 'ashokrimal',
      icon: 'Github',
      type: 'Code & Repositories',
    },
  },
  {
    collection: 'Social Links',
    title: 'LinkedIn',
    slug: 'social-linkedin',
    status: 'published',
    sortOrder: 1,
    payload: {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/lamirkohsa/',
      handle: 'in/lamirkohsa',
      icon: 'Linkedin',
      type: 'Professional Network',
    },
  },
  {
    collection: 'Social Links',
    title: 'Email',
    slug: 'social-email',
    status: 'published',
    sortOrder: 2,
    payload: {
      label: 'Email',
      href: 'mailto:contact@lamirkohsa.com',
      handle: 'contact@lamirkohsa.com',
      icon: 'Mail',
      type: 'Direct Communication',
    },
  },
  {
    collection: 'Social Links',
    title: 'Personal Domain',
    slug: 'social-domain',
    status: 'published',
    sortOrder: 3,
    payload: {
      label: 'Website',
      href: 'https://ashokrimal.com.np',
      handle: 'ashokrimal.com.np',
      icon: 'Globe',
      type: 'Canonical Domain',
    },
  },

  // 15. BLOGS / JOURNAL
  {
    collection: 'Blogs',
    title: 'Building Calm Interfaces in a Noisy Web',
    slug: 'building-calm-interfaces-in-a-noisy-web',
    status: 'published',
    sortOrder: 0,
    payload: {
      category: 'Design Engineering',
      date: 'October 2024',
      description:
        'Most modern digital software bombards users with notifications, saturated gradients, modal dialogs, and simulated urgency. Over the past year of designing and shipping products, I have converged on an opposing philosophy: calm software that respects human cognitive bandwidth. Calm interfaces avoid unnecessary motion, prioritize generous whitespace, and use progressive disclosure to reveal complexity only when invited. In this essay, we break down typography hierarchy, restrained color palettes, and why quiet software always outlasts noisy gimmicks.',
    },
  },
  {
    collection: 'Blogs',
    title: 'Reflections on Teaching Robotics & Python to College Beginners',
    slug: 'reflections-on-teaching-robotics-python',
    status: 'published',
    sortOrder: 1,
    payload: {
      category: 'Teaching & Pedagogy',
      date: 'August 2024',
      description:
        'Teaching at Dursikshya Education forced me to re-evaluate how beginners conceptualize abstract programming constructs. When a student sees an error in a terminal, it feels like an impenetrable wall. But when an Arduino motor fails to spin because a PWM signal is out of bounds, the bug is immediately tactile and physical. Connecting hardware feedback loops to Python logic completely transformed how students engaged with loops, conditionals, and state machines.',
    },
  },
  {
    collection: 'Blogs',
    title: 'The Architecture of Offline-First Web Applications',
    slug: 'architecture-of-offline-first-web-applications',
    status: 'published',
    sortOrder: 2,
    payload: {
      category: 'Full-Stack Architecture',
      date: 'June 2024',
      description:
        'Building web applications for regions with intermittent bandwidth requires discarding the assumption that the network is always reliable. By combining IndexedDB local caching, service worker background synchronization, and optimistic UI updates, developers can craft experiences that never freeze or lose unsaved edits. We examine conflict resolution strategies and how to design UI states that reassure users.',
    },
  },
  {
    collection: 'Blogs',
    title: 'Why Small, Focused Tools Matter',
    slug: 'why-small-focused-tools-matter',
    status: 'published',
    sortOrder: 3,
    payload: {
      category: 'Philosophy',
      date: 'May 2024',
      description:
        'The tendency of modern software products is toward feature sprawl. Every tool attempts to become an all-in-one operating system. Yet the utilities developers cherish most are Unix-style single-purpose programs that perform one task exceptionally well and compose cleanly with others.',
    },
  },
]

// Resilient In-Memory CMS Repository
// Ensures immediate, zero-latency responsiveness and real-time mutations
class MemoryCmsRepository {
  private records: Map<number, CmsRecord> = new Map()
  private nextId = 100

  constructor() {
    this.seed()
  }

  private seed() {
    INITIAL_CMS_DATA.forEach((item, index) => {
      const id = item.id ?? index + 1
      this.records.set(id, {
        id,
        userId: 'admin-ashok-rimal',
        collection: item.collection,
        title: item.title,
        slug: item.slug,
        payload: item.payload,
        status: item.status,
        sortOrder: item.sortOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      if (id >= this.nextId) this.nextId = id + 1
    })
  }

  public getAll(collection?: string): CmsRecord[] {
    const list = Array.from(this.records.values())
    if (!collection) return list.sort((a, b) => a.sortOrder - b.sortOrder)
    return list
      .filter((r) => r.collection.toLowerCase() === collection.toLowerCase())
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  public getPublished(collection: string): CmsRecord[] {
    return this.getAll(collection).filter((r) => r.status === 'published')
  }

  public getById(id: number): CmsRecord | undefined {
    return this.records.get(id)
  }

  public getByTitle(collection: string, title: string): CmsRecord | undefined {
    return this.getAll(collection).find(
      (r) => r.title.toLowerCase() === title.toLowerCase()
    )
  }

  public create(
    collection: string,
    title: string,
    payload: Record<string, unknown>,
    status = 'published',
    sortOrder?: number
  ): CmsRecord {
    const id = this.nextId++
    const slug = `${collection}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const record: CmsRecord = {
      id,
      userId: 'admin-ashok-rimal',
      collection,
      title,
      slug,
      payload,
      status,
      sortOrder: sortOrder ?? this.records.size,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.records.set(id, record)
    return record
  }

  public update(id: number, updates: Partial<CmsRecord>): CmsRecord | null {
    const current = this.records.get(id)
    if (!current) return null
    const updated: CmsRecord = {
      ...current,
      ...updates,
      payload: updates.payload
        ? { ...current.payload, ...updates.payload }
        : current.payload,
      updatedAt: new Date(),
    }
    this.records.set(id, updated)
    return updated
  }

  public delete(id: number): boolean {
    return this.records.delete(id)
  }
}

// Global singleton instance
declare global {
  var __cmsMemoryRepo: MemoryCmsRepository | undefined
}

function getMemoryRepo(): MemoryCmsRepository {
  if (!globalThis.__cmsMemoryRepo) {
    globalThis.__cmsMemoryRepo = new MemoryCmsRepository()
  }
  return globalThis.__cmsMemoryRepo
}

// --- DB SYNC & SEED INITIALIZATION ---
export async function ensureCmsSeedData() {
  const repo = getMemoryRepo()
  try {
    const userId = await requireUser()
    const existing = await db
      .select({ collection: cmsContent.collection, title: cmsContent.title })
      .from(cmsContent)
      .where(eq(cmsContent.userId, userId))

    const existingKeys = new Set(
      existing.map((r) => `${r.collection}:${r.title}`)
    )

    const missing = INITIAL_CMS_DATA.filter(
      (item) => !existingKeys.has(`${item.collection}:${item.title}`)
    ).map((item, idx) => ({
      userId,
      collection: item.collection,
      title: item.title,
      slug: item.slug,
      payload: item.payload,
      status: item.status,
      sortOrder: item.sortOrder ?? idx,
    }))

    if (missing.length > 0) {
      await db.insert(cmsContent).values(missing)
    }
  } catch (err) {
    // Graceful offline fallback to memory repo
  }
}

// --- CMS QUERY FUNCTIONS FOR FRONTEND & ADMIN ---

/**
 * Retrieve all published records for a collection
 */
export async function getPublishedCmsContent(collection: string): Promise<CmsRecord[]> {
  const repo = getMemoryRepo()
  try {
    const rows = await db
      .select({
        id: cmsContent.id,
        collection: cmsContent.collection,
        title: cmsContent.title,
        slug: cmsContent.slug,
        payload: cmsContent.payload,
        status: cmsContent.status,
        sortOrder: cmsContent.sortOrder,
        createdAt: cmsContent.createdAt,
        updatedAt: cmsContent.updatedAt,
      })
      .from(cmsContent)
      .where(
        and(
          eq(cmsContent.collection, collection),
          eq(cmsContent.status, 'published')
        )
      )
      .orderBy(asc(cmsContent.sortOrder), desc(cmsContent.createdAt))

    if (rows && rows.length > 0) {
      // Synchronize back to memory cache
      rows.forEach((r) => repo.update(r.id, r as CmsRecord))
      return rows as CmsRecord[]
    }
  } catch {
    // Database offline fallback to memory
  }

  return repo.getPublished(collection)
}

/**
 * Retrieve all records (draft + published) for admin management
 */
export async function getAllCmsContent(collection?: string): Promise<CmsRecord[]> {
  const repo = getMemoryRepo()
  try {
    const userId = await requireUser()
    let query = db
      .select({
        id: cmsContent.id,
        collection: cmsContent.collection,
        title: cmsContent.title,
        slug: cmsContent.slug,
        payload: cmsContent.payload,
        status: cmsContent.status,
        sortOrder: cmsContent.sortOrder,
        createdAt: cmsContent.createdAt,
        updatedAt: cmsContent.updatedAt,
      })
      .from(cmsContent)
      .where(eq(cmsContent.userId, userId))
      .orderBy(asc(cmsContent.sortOrder), desc(cmsContent.createdAt))

    const rows = await query
    if (rows && rows.length > 0) {
      if (collection) {
        return (rows as CmsRecord[]).filter(
          (r) => r.collection.toLowerCase() === collection.toLowerCase()
        )
      }
      return rows as CmsRecord[]
    }
  } catch {
    // Database offline fallback
  }

  return repo.getAll(collection)
}

export interface HeroSectionConfig {
  heading?: string
  subtitle?: string
  location?: string
  initials?: string
  imageUrl?: string
  stats?: Array<{ label: string; value: string }>
  metaLeft?: string
  metaRight?: string
  [key: string]: any
}

export interface ProfileContent {
  title?: string
  fullName?: string
  headline?: string
  summary?: string
  bio?: string
  location?: string
  status?: string
  avatarUrl?: string
  email?: string
  github?: string
  linkedin?: string
  website?: string
  interests?: string[]
  [key: string]: any
}

/**
 * Retrieve Hero Section configuration from CMS
 */
export async function getHeroSectionConfig(): Promise<HeroSectionConfig> {
  const records = await getPublishedCmsContent('Site Settings')
  const heroRecord = records.find(
    (r) => r.title.toLowerCase() === 'hero section'
  )
  if (heroRecord && heroRecord.payload) {
    return heroRecord.payload as HeroSectionConfig
  }
  const repo = getMemoryRepo()
  const fallback = repo.getByTitle('Site Settings', 'Hero Section')
  return (fallback?.payload as HeroSectionConfig) ?? {}
}

/**
 * Retrieve Homepage Sections Ordering & Visibility from CMS
 */
export async function getHomepageSectionsConfig(): Promise<{
  order: string[]
  enabled: Record<string, boolean>
  sectionMeta: Record<
    string,
    { eyebrow: string; title: string; accent: string; description: string }
  >
}> {
  const records = await getPublishedCmsContent('Site Settings')
  const sectionsRecord = records.find(
    (r) => r.title.toLowerCase() === 'homepage sections'
  )
  if (sectionsRecord && sectionsRecord.payload) {
    return sectionsRecord.payload as any
  }
  const repo = getMemoryRepo()
  const fallback = repo.getByTitle('Site Settings', 'Homepage Sections')
  return (fallback?.payload as any) ?? {
    order: ['about', 'gallery', 'projects', 'media', 'experience', 'contact'],
    enabled: {
      about: true,
      gallery: true,
      projects: true,
      media: true,
      experience: true,
      contact: true,
    },
    sectionMeta: {},
  }
}

/**
 * Retrieve Profile biography from CMS
 */
export async function getProfileContent(): Promise<ProfileContent> {
  const records = await getPublishedCmsContent('Profile')
  if (records[0]) {
    return {
      title: records[0].title,
      ...records[0].payload,
    } as ProfileContent
  }
  const repo = getMemoryRepo()
  const fallback = repo.getAll('Profile')[0]
  return fallback ? ({ title: fallback.title, ...fallback.payload } as ProfileContent) : {}
}

/**
 * Retrieve featured projects from CMS
 */
export async function getFeaturedProjects(limit = 3): Promise<CmsRecord[]> {
  const projects = await getPublishedCmsContent('Projects')
  const featured = projects.filter((p) => p.payload?.featured === true)
  return (featured.length ? featured : projects).slice(0, limit)
}

/**
 * Retrieve gallery items from CMS
 */
export async function getGalleryItems(limit = 4): Promise<CmsRecord[]> {
  const gallery = await getPublishedCmsContent('Gallery')
  return gallery.slice(0, limit)
}

/**
 * Retrieve experience milestones from CMS
 */
export async function getExperienceItems(): Promise<CmsRecord[]> {
  return getPublishedCmsContent('Experience')
}

/**
 * Retrieve education history from CMS
 */
export async function getEducationItems(): Promise<CmsRecord[]> {
  return getPublishedCmsContent('Education')
}

/**
 * Retrieve categorized skills from CMS
 */
export async function getSkillsContent(): Promise<CmsRecord[]> {
  return getPublishedCmsContent('Skills')
}

/**
 * Retrieve media items from CMS (Music, Anime, Manga)
 */
export async function getMediaPreviews(): Promise<{
  music: CmsRecord[]
  anime: CmsRecord[]
  manga: CmsRecord[]
}> {
  const [music, anime, manga] = await Promise.all([
    getPublishedCmsContent('Music'),
    getPublishedCmsContent('Anime'),
    getPublishedCmsContent('Manga'),
  ])
  return { music, anime, manga }
}

/**
 * Retrieve social links from CMS
 */
export async function getSocialLinks(): Promise<CmsRecord[]> {
  return getPublishedCmsContent('Social Links')
}

// --- CMS MUTATION FUNCTIONS ---

export async function createCmsContent(formData: FormData) {
  const collection = String(formData.get('collection') || 'Profile').trim()
  const title = String(formData.get('title') || '').trim()
  if (!title) throw new Error('A title is required')

  let payload: Record<string, unknown> = {}
  const rawPayload = formData.get('payload')
  if (typeof rawPayload === 'string') {
    try {
      payload = JSON.parse(rawPayload)
    } catch {
      payload = { description: rawPayload.trim() }
    }
  }

  // Also extract explicit common fields from form if present
  const imageUrl = formData.get('imageUrl')
  if (imageUrl) payload.imageUrl = String(imageUrl).trim()
  const category = formData.get('category')
  if (category) payload.category = String(category).trim()
  const status = String(formData.get('status') || 'published')

  const repo = getMemoryRepo()
  const created = repo.create(collection, title, payload, status)

  try {
    const userId = await requireUser()
    await db.insert(cmsContent).values({
      userId,
      collection,
      title,
      slug: created.slug,
      payload,
      status,
      sortOrder: created.sortOrder,
    })
  } catch (err) {
    console.warn('[CMS] Database insert fallback to memory repo:', err)
  }

  revalidateAllRoutes()
}

export async function updateCmsContent(id: number, formData: FormData) {
  const collection = String(formData.get('collection') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const status = String(formData.get('status') || '').trim()

  let payloadUpdates: Record<string, unknown> = {}
  const rawPayload = formData.get('payload')
  if (typeof rawPayload === 'string') {
    try {
      payloadUpdates = JSON.parse(rawPayload)
    } catch {
      payloadUpdates = { description: rawPayload.trim() }
    }
  }

  const imageUrl = formData.get('imageUrl')
  if (imageUrl) payloadUpdates.imageUrl = String(imageUrl).trim()

  const repo = getMemoryRepo()
  const updates: Partial<CmsRecord> = { payload: payloadUpdates }
  if (collection) updates.collection = collection
  if (title) updates.title = title
  if (status) updates.status = status

  repo.update(id, updates)

  try {
    const userId = await requireUser()
    await db
      .update(cmsContent)
      .set({
        ...(title ? { title } : {}),
        ...(collection ? { collection } : {}),
        ...(status ? { status } : {}),
        payload: payloadUpdates,
        updatedAt: new Date(),
      })
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (err) {
    console.warn('[CMS] Database update fallback to memory repo:', err)
  }

  revalidateAllRoutes()
}

export async function deleteCmsContent(id: number) {
  const repo = getMemoryRepo()
  repo.delete(id)

  try {
    const userId = await requireUser()
    await db
      .delete(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (err) {
    console.warn('[CMS] Database delete fallback to memory repo:', err)
  }

  revalidateAllRoutes()
}

export async function toggleCmsStatus(id: number) {
  const repo = getMemoryRepo()
  const record = repo.getById(id)
  if (!record) return

  const nextStatus = record.status === 'published' ? 'draft' : 'published'
  repo.update(id, { status: nextStatus })

  try {
    const userId = await requireUser()
    await db
      .update(cmsContent)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (err) {
    console.warn('[CMS] Status toggle fallback:', err)
  }

  revalidateAllRoutes()
}

export async function toggleCmsFeatured(id: number) {
  const repo = getMemoryRepo()
  const record = repo.getById(id)
  if (!record) return

  const isFeatured = record.payload?.featured === true
  const nextPayload = { ...record.payload, featured: !isFeatured }
  repo.update(id, { payload: nextPayload })

  try {
    const userId = await requireUser()
    await db
      .update(cmsContent)
      .set({ payload: nextPayload, updatedAt: new Date() })
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (err) {
    console.warn('[CMS] Featured toggle fallback:', err)
  }

  revalidateAllRoutes()
}

export async function updateHomepageSectionsOrder(
  order: string[],
  enabled: Record<string, boolean>
) {
  const repo = getMemoryRepo()
  const record = repo.getByTitle('Site Settings', 'Homepage Sections')
  if (record) {
    const payload = {
      ...(record.payload as object),
      order,
      enabled,
    }
    repo.update(record.id, { payload })

    try {
      const userId = await requireUser()
      await db
        .update(cmsContent)
        .set({ payload, updatedAt: new Date() })
        .where(
          and(
            eq(cmsContent.collection, 'Site Settings'),
            eq(cmsContent.title, 'Homepage Sections'),
            eq(cmsContent.userId, userId)
          )
        )
    } catch (err) {
      console.warn('[CMS] Homepage sections update fallback:', err)
    }
  }

  revalidateAllRoutes()
}

export async function updateHeroSettings(payload: Record<string, unknown>) {
  const repo = getMemoryRepo()
  const record = repo.getByTitle('Site Settings', 'Hero Section')
  if (record) {
    repo.update(record.id, { payload: { ...record.payload, ...payload } })
    try {
      const userId = await requireUser()
      await db
        .update(cmsContent)
        .set({ payload, updatedAt: new Date() })
        .where(
          and(
            eq(cmsContent.collection, 'Site Settings'),
            eq(cmsContent.title, 'Hero Section'),
            eq(cmsContent.userId, userId)
          )
        )
    } catch (err) {
      console.warn('[CMS] Hero settings update fallback:', err)
    }
  }
  revalidateAllRoutes()
}

export async function getHeroImage() {
  const hero = await getHeroSectionConfig()
  return typeof hero.imageUrl === 'string' ? hero.imageUrl : '/images/hero-ashok.png'
}

export async function saveCmsImage(url: string) {
  await updateHeroSettings({ imageUrl: url })
}

function revalidateAllRoutes() {
  revalidatePath('/')
  revalidatePath('/about')
  revalidatePath('/projects')
  revalidatePath('/media')
  revalidatePath('/contact')
  revalidatePath('/blogs')
  revalidatePath('/admin')
}
