import Image from 'next/image'
import Link from 'next/link'

type EmptyCollectionStateProps = { eyebrow?: string; title: string; description: string; action?: { label: string; href: string } }

export default function EmptyCollectionState({ eyebrow = 'Nothing here yet', title, description, action }: EmptyCollectionStateProps) {
  return <div className="empty-collection-state"><div className="empty-state-visual"><Image src="/images/empty-collection.png" alt="An empty shelf waiting for the next collection" width={180} height={180} priority={false} /><span className="empty-state-orbit empty-state-orbit-one" /><span className="empty-state-orbit empty-state-orbit-two" /></div><div className="empty-state-copy"><p className="section-label">{eyebrow}</p><h2>{title}</h2><p>{description}</p>{action && <Link className="text-link" href={action.href}>{action.label} {'>'}</Link>}</div></div>
}
