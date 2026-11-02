'use client';

// Group React imports
import { 
  Suspense, 
  useMemo, 
  useRef, 
  useState, 
  useEffect 
} from 'react';

// Next.js imports
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';

// Framer Motion imports
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from 'framer-motion';

// Component imports
import ScrollObserver from '@/components/ScrollObserver';
import ErrorBoundary from '@/components/ErrorBoundaryWrapper';
import { Loading } from '@/components/Loading';
import { useDevMode } from '@/contexts/DevModeContext';
import DevSection from '@/components/devmode/DevSection';
import { ErrorPage } from '@/components/ErrorPage';
import { PageLayout } from '@/components/layouts/PageLayout';
import SnakeTrail from '@/components/effects/SnakeTrail';

const ThreeHero = dynamic(() => import('@/components/ThreeHero'), { 
  ssr: false,
  loading: () => <Loading variant="hero" />
});

export interface FeaturedProject {
  title: string;
  blurb: string;
  tech: string[];
  image: string;
}

export interface Certificate {
  name: string;
  image: string;
  scale: number;
}

export interface HomeContentProps {
  featuredProjects?: FeaturedProject[];
  certificates?: Certificate[];
}

const PAGE_KEY = 'home';
const DEFAULT_SECTIONS = ['hero', 'about', 'credentials', 'featured', 'cta'] as const;

type SectionId = (typeof DEFAULT_SECTIONS)[number];

type HomeViewData = {
  featured: FeaturedProject[];
  certificates: Certificate[];
};

type SectionRenderer = (data: HomeViewData) => JSX.Element;

const SECTION_ACCENTS: Record<SectionId, string> = {
  hero: '#2563eb',
  about: '#9333ea',
  credentials: '#0f172a',
  featured: '#1d4ed8',
  cta: '#1f2937',
};





function FloatingElements() {
  const elements = [
    { text: 'React', className: 'text-pink-500' },
    { text: 'TypeScript', className: 'text-blue-500' },
    { text: 'Node.js', className: 'text-green-500' },
    { text: 'Next.js', className: 'text-black' },
    { text: 'Tailwind', className: 'text-cyan-400' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {elements.map((el, i) => {
        const duration = 10 + Math.random() * 10;
        const delay = Math.random() * 5;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        return (
          <motion.div
            key={i}
            className={`absolute text-lg font-mono font-bold opacity-10 ${el.className}`}
            initial={{
              x: `${x}%`,
              y: `${y}%`,
              rotate: Math.random() * 360,
            }}
            animate={{
              x: [
                `${x}%`,
                `${x + (Math.random() - 0.5) * 40}%`,
                `${x}%`,
              ],
              y: [
                `${y}%`,
                `${y + (Math.random() - 0.5) * 40}%`,
                `${y}%`,
              ],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {el.text}
          </motion.div>
        );
      })}
    </div>
  );
}

function ClassicHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const springConfig = { damping: 20, stiffness: 300 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const xPos = e.clientX - rect.left;
      const yPos = e.clientY - rect.top;
      
      // Calculate percentage from center (-1 to 1)
      const xPercent = ((xPos / rect.width) - 0.5) * 2;
      const yPercent = ((yPos / rect.height) - 0.5) * 2;
      
      setMousePosition({ x: xPercent * 20, y: yPercent * 20 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    x.set(mousePosition.x);
    y.set(mousePosition.y);
  }, [mousePosition, x, y]);

  const rotateX = useTransform(y, [-20, 20], [5, -5]);
  const rotateY = useTransform(x, [-20, 20], [-5, 5]);

  return (
    <section 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50"
    >
      <SnakeTrail />
      <FloatingElements />
      
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,white,transparent)]"></div>
      </div>
      
      <motion.div 
        className="relative z-10 p-6 max-w-6xl mx-auto"
        style={{
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-blue-600 shadow-lg backdrop-blur-sm">
            Open to internships &amp; freelance engagements
          </span>
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Hi, I&apos;m <span className="text-blue-600">Ashok Rimal</span>.
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            I bring ideas to life with code.
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-600 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          A versatile developer specializing in full-stack web experiences and cross-platform mobile apps. I love partnering with teams to solve real-world problems and ship polished products.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            href="/projects"
            className="group relative inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <span className="relative z-10">View My Projects</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          <a
            href="/resume.pdf"
            download="Ashok-Rimal-Resume.pdf"
            className="group relative inline-flex items-center justify-center bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-200 transition-all duration-300 hover:shadow-md"
          >
            <span className="relative z-10">Download My Resume</span>
            <span className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </a>
        </motion.div>
        
        <motion.div 
          className="mt-16 flex items-center justify-center gap-8 text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span>Available for work</span>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span>Based in Kathmandu, Nepal</span>
          </div>
        </motion.div>
      </motion.div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"></path>
            <path d="m19 12-7 7-7-7"></path>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

function ClassicAboutSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-in-up">
            <Image
              src="https://github.com/ashokrimal.png"
              alt="Ashok Rimal"
              className="rounded-2xl w-full shadow-xl"
              width={640}
              height={640}
            />
          </div>
          <div className="fade-in-up" style={{ transitionDelay: '200ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold">From concept to launch.</h2>
            <p className="text-lg text-gray-600 mt-6">
              I craft human-centered digital products that blend clean interfaces with reliable engineering. Whether you need a rapid prototype, a production-ready web app, or a cross-platform mobile experience, I can help turn your brief into a shipped solution.
            </p>
            <p className="text-lg text-gray-600 mt-4">
              Currently pursuing Computer Engineering at Tribhuvan University, I&apos;m actively looking for internships and freelance collaborations where I can contribute, learn fast, and deliver real value.
            </p>
            <Link href="/about" className="inline-flex items-center mt-8 text-blue-600 font-semibold text-lg hover:text-blue-800 transition">
              Get to know me &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClassicCredentialsSection({ certificates }: { certificates: Certificate[] }) {
  return (
    <section className="py-16 md:py-20 bg-gray-100/80">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Credentials &amp; Certificates</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-10 opacity-80">
          {certificates.map(({ name, image, scale }) => (
            <div key={name} className="flex h-12 w-36 items-center justify-center">
              <Image
                src={image}
                alt={name}
                width={144}
                height={48}
                className="max-h-12 w-auto object-contain"
                style={{ transform: `scale(${scale})` }}
              />
            </div>
          ))}
          {certificates.length === 0 && (
            <div className="flex h-12 items-center justify-center rounded-full border border-dashed border-gray-300 px-6 text-sm text-gray-500">
              More badges coming soon
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ClassicFeaturedSection({ featured }: { featured: FeaturedProject[] }) {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Featured Work</h2>
          <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
            A snapshot of the products I&apos;ve shipped. Explore the full case studies to see the challenges tackled and the impact delivered.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((project, index) => (
            <article
              key={project.title}
              className="fade-in-up group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div className="relative overflow-hidden">
                <Image
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  width={800}
                  height={600}
                  className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{project.blurb}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map(tech => (
                    <span key={tech} className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {tech}
                    </span>
                  ))}
                </div>
                <Link
                  href="/projects"
                  className="mt-auto inline-flex items-center text-blue-600 font-semibold transition-colors duration-300 group-hover:text-blue-800"
                >
                  Read the case study &rarr;
                </Link>
              </div>
            </article>
          ))}
          {featured.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
              <span className="text-lg font-semibold">Projects loading</span>
              <p className="text-sm">Stay tuned—new builds are on their way.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ClassicCtaSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold">Let&apos;s build something great.</h2>
        <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
          Have an internship role, freelance project, or product idea in mind? I&apos;d love to learn about it and explore how I can help.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-transform hover:scale-105"
          >
            Start a Conversation
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify.center border border-blue-200 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
          >
            See project outcomes
          </Link>
        </div>
      </div>
    </section>
  );
}

function ClassicHomeView(data: HomeViewData) {
  const { featured, certificates } = data;
  return (
    <>
      <ScrollObserver />
      <ClassicHeroSection />
      <ClassicAboutSection />
      <ClassicCredentialsSection certificates={certificates} />
      <ClassicFeaturedSection featured={featured} />
      <ClassicCtaSection />
    </>
  );
}

function DevHeroSection() {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="hero"
      label="Hero"
      fallbackAccent={SECTION_ACCENTS.hero}
      className="bg-slate-900 text-slate-100"
    >
      <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950">
        <div className="pointer-events.none absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1400&q=60')] bg-cover bg-center opacity-20" />
        <div className="relative space-y-6 p-8">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400" />
            DEV ENVIRONMENT
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            ~/portfolio — building next experiences
          </h1>
          <p className="font-mono text-sm text-emerald-300">
            git pull origin main && npm run dev
          </p>
          <p className="text-slate-200">
            Use the CLI to explore sections and view information.
          </p>
        </div>
      </div>
    </DevSection>
  );
}

function DevAboutSection() {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="about"
      label="Story"
      fallbackAccent={SECTION_ACCENTS.about}
    >
      <ClassicAboutSection />
    </DevSection>
  );
}

function DevCredentialsSection({ certificates }: HomeViewData) {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="credentials"
      label="Credentials"
      fallbackAccent={SECTION_ACCENTS.credentials}
    >
      <ClassicCredentialsSection certificates={certificates} />
    </DevSection>
  );
}

function DevFeaturedSection({ featured }: HomeViewData) {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="featured"
      label="Projects"
      fallbackAccent={SECTION_ACCENTS.featured}
    >
      <ClassicFeaturedSection featured={featured} />
    </DevSection>
  );
}

function DevCtaSection() {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="cta"
      label="CTA"
      fallbackAccent={SECTION_ACCENTS.cta}
    >
      <ClassicCtaSection />
    </DevSection>
  );
}

// Single SectionRenderer type definition
const DEV_RENDERERS = {
  hero: () => <DevHeroSection />,
  about: () => <DevAboutSection />,
  credentials: (data: HomeViewData) => <DevCredentialsSection certificates={data.certificates} featured={[]} />,
  featured: (data: HomeViewData) => <DevFeaturedSection featured={data.featured} certificates={[]} />,
  cta: () => <DevCtaSection />,
} satisfies Record<SectionId, SectionRenderer>;

function HomeContent({ featuredProjects = [], certificates = [] }: HomeContentProps) {
  const { mode, registerPageSections, getSectionOrder } = useDevMode();

  const data = useMemo<HomeViewData>(
    () => ({
      featured: featuredProjects,
      certificates,
    }),
    [featuredProjects, certificates]
  );

  useEffect(() => {
    registerPageSections(PAGE_KEY, DEFAULT_SECTIONS as unknown as string[]);
  }, [registerPageSections]);

  const orderedSections = useMemo(() => {
    const sections = getSectionOrder(PAGE_KEY, DEFAULT_SECTIONS as unknown as string[]);
    const filtered = sections.filter((section): section is SectionId =>
      (DEFAULT_SECTIONS as readonly string[]).includes(section as SectionId),
    );
    return filtered.length ? filtered : [...DEFAULT_SECTIONS];
  }, [getSectionOrder]);

  return (
    <PageLayout
      loadingVariant="page"
      errorTitle="Error loading content"
      errorMessage="We're having trouble loading the content. Please try again later."
    >
      <ScrollObserver />
      {mode === 'classic' ? (
        <ClassicHomeView {...data} />
      ) : (
        <div className="relative space-y-12">
          {orderedSections.map(sectionId => (
            <div key={sectionId}>{DEV_RENDERERS[sectionId](data)}</div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

export default HomeContent;