import { education, experience, profile, skills } from '@/lib/portfolio-data'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { getPublishedCmsContent } from '@/app/actions/content-cms'
import { MediaGallerySection } from '@/components/media/MediaGallerySection'

export default async function AboutContent() {
  const [publishedProfile, publishedExperience, publishedEducation] = await Promise.all([
    getPublishedCmsContent('Profile'),
    getPublishedCmsContent('Experience'),
    getPublishedCmsContent('Education'),
  ])

  return <main className="about-page shell-width">
    <section className="about-intro"><p className="section-label">About / Ashok Rimal</p><h1>Making things<br /><span className="accent-text">matter.</span></h1><p className="about-lede">{profile.summary} Based in {profile.location}.</p><p className="about-bio">I enjoy turning open questions into clear, dependable digital experiences. My current focus is frontend development, useful products, AI, robotics, and learning through practice.</p></section>
    <MediaGallerySection />
    <section className="about-story"><div><p className="section-label">Professional overview</p></div><div><p>My work sits between development, product thinking, and teaching. I build accessible interfaces, dependable systems, and practical technology that helps people move forward.</p><p>Outside of development, I follow music, anime, manga, photography, and the small details that make everyday life worth noticing.</p>{publishedProfile.length > 0 && <div className="cms-published-notes">{publishedProfile.map((record) => <p key={record.id}><strong>{record.title}</strong> {String(record.payload.description || '')}</p>)}</div>}</div></section>
    <section className="profile-section" aria-labelledby="experience-heading"><div className="section-heading"><div><p className="section-label">01 / Experience</p><h2 id="experience-heading">Work in<br /><span className="accent-text">practice.</span></h2></div><p>Roles where curiosity became useful work.</p></div><Timeline items={experience} cmsItems={publishedExperience} /></section>
    <section className="profile-section" aria-labelledby="education-heading"><div className="section-heading"><div><p className="section-label">02 / Education</p><h2 id="education-heading">Learning with<br /><span className="accent-text">intention.</span></h2></div><p>The foundations behind the work.</p></div><Timeline items={education} cmsItems={publishedEducation} /></section>
    <section className="profile-section about-toolkit" aria-labelledby="toolkit-heading"><div className="section-heading"><div><p className="section-label">03 / Toolkit</p><h2 id="toolkit-heading">Tools for turning<br /><span className="accent-text">ideas real.</span></h2></div><p>A practical stack, always in motion.</p></div><div className="toolkit-card-grid">{skills.slice(0, 6).map((group, index) => <article className="toolkit-card" key={group.category}><div className="toolkit-card-top"><span className="toolkit-card-index">0{index + 1}</span><span className="toolkit-card-mark" aria-hidden="true">+</span></div><h3>{group.category}</h3><div className="toolkit-chip-list">{group.items.map((item) => <span className="toolkit-chip" key={item}>{item}</span>)}</div></article>)}</div></section>
    <section className="profile-section about-proof" aria-labelledby="proof-heading"><div className="section-heading"><div><p className="section-label">04 / Proof</p><h2 id="proof-heading">Still being<br /><span className="accent-text">collected.</span></h2></div><p>Only verified milestones belong here.</p></div><div className="proof-empty-grid"><EmptyCollectionState eyebrow="Certificates / Empty" title="No certificates published yet." description="Verified learning milestones will appear here when they are ready to share." /><EmptyCollectionState eyebrow="Awards / Empty" title="No awards published yet." description="Recognition and meaningful milestones will appear here when they are documented." /></div></section>
  </main>
}

type TimelineItem = { period: string; title: string; organization: string; description: string }
type CmsItem = { id: number; title: string; payload: unknown }
function Timeline({ items, cmsItems }: { items: TimelineItem[]; cmsItems: CmsItem[] }) { return <div className="about-timeline">{items.map((item) => <article className="about-timeline-item" key={`${item.organization}-${item.title}`}><p className="timeline-period">{item.period}</p><div className="timeline-rule" /><div><h3>{item.title}</h3><p className="timeline-org">{item.organization}</p><p>{item.description}</p></div></article>)}{cmsItems.map((record) => <article className="about-timeline-item cms-timeline-item" key={record.id}><p className="timeline-period">Published</p><div className="timeline-rule" /><div><h3>{record.title}</h3><p>{typeof record.payload === 'object' && record.payload && 'description' in record.payload ? String(record.payload.description) : ''}</p></div></article>)}</div> }
