import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import ScrollObserver from '@/components/ScrollObserver';
// import freecodecampLogo from './logos/freecodecamp.webp';
import udemyLogo from './logos/udemy.webp';
import courseraLogo from './logos/coursera.webp';
import ciscoLogo from './logos/cisco.svg';

const ThreeHero = dynamic(() => import('@/components/ThreeHero'), { ssr: false });

const featuredProjects = [
  {
    title: 'KaryaMantra',
    blurb: 'A productivity web app that helps students organize assignments with real-time status tracking.',
    tech: ['React', 'Firebase', 'Tailwind CSS'],
    image: 'https://placehold.co/800x600/0f172a/ffffff?text=KaryaMantra',
  },
  {
    title: 'BuyNepal Marketplace',
    blurb: 'A full-stack e-commerce experience for local artisans, supporting secure checkout and admin dashboards.',
    tech: ['Next.js', 'Node.js', 'MongoDB'],
    image: 'https://placehold.co/800x600/1d4ed8/ffffff?text=BuyNepal',
  },
  {
    title: 'InsightHub',
    blurb: 'InsightHub is building the future of data exchange, empowering individuals and organizations to unlock the value of their knowledge.',
    tech: ['React Native', 'Express', 'Socket.io'],
    image: 'https://placehold.co/800x600/0ea5e9/ffffff?text=InsightHub',
  },
  
];

const certificates = [
  // { name: 'freeCodeCamp', image: freecodecampLogo, scale: 1.35 },
  { name: 'Udemy', image: udemyLogo, scale: 1.2 },
  { name: 'Coursera', image: courseraLogo, scale: 0.96 },
  { name: 'Cisco', image: ciscoLogo, scale: 1.2 },
];

export default function HomePage() {
  return (
    <div className="relative">
      <ScrollObserver />
      <section className="min-h-screen flex items-center justify-center text-center relative overflow-hidden">
        <ThreeHero />
        <div className="relative z-10 p-6">
          <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm">
            Open to internships & freelance engagements
          </span>
          <h1 className="hero-title text-gray-900 mt-6">Hi, I&apos;m Ashok Rimal. I bring ideas to life with code.</h1>
          <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto text-gray-600">
            A versatile developer specializing in full-stack web experiences and cross-platform mobile apps. I love partnering with teams to solve real-world problems and ship polished products.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-transform hover:scale-105"
            >
              View My Projects
            </Link>
            <a
              href="/resume.pdf"
              download="Ashok-Rimal-Resume.pdf"
              className="inline-flex items-center justify-center border border-blue-200 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
            >
              Download My Resume
            </a>
          </div>
        </div>
      </section>

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
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Featured Work</h2>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              A snapshot of the products I&apos;ve shipped. Explore the full case studies to see the challenges tackled and the impact delivered.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project, index) => (
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
          </div>
          <div className="text-center mt-16">
            <Link href="/projects" className="inline-flex items-center text-blue-600 font-semibold text-lg hover:text-blue-800 transition">
              Browse all projects &rarr;
            </Link>
          </div>
        </div>
      </section>

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
              className="inline-flex items-center justify-center border border-blue-200 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
            >
              See project outcomes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
