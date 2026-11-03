import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { createGalleryItem, deleteGalleryItem, getAdminContent } from '@/app/actions/content'
import AdminSignOut from '@/components/auth/AdminSignOut'
import ProfileSettingsForm from '@/components/admin/ProfileSettingsForm'
import { getSettingsForAdmin } from '@/app/actions/settings'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const { gallery, projects } = await getAdminContent()
  const settings = await getSettingsForAdmin()
  return <main className="admin-page shell-width"><header className="admin-header"><div><p className="section-label">Admin / Content studio</p><h1>Good morning, <em>{session.user.name.split(' ')[0]}.</em></h1></div><div className="admin-actions"><a href="/" className="text-link">View site ↗</a><AdminSignOut /></div></header><div className="admin-stats"><div><strong>{projects.length}</strong><span>Projects</span></div><div><strong>{gallery.length}</strong><span>Gallery items</span></div><div><strong>Live</strong><span>Site status</span></div></div><section className="admin-panel"><div className="panel-heading"><div><p className="section-label">Gallery</p><h2>Manage your <em>archive.</em></h2></div><span>{gallery.length} items</span></div><form className="gallery-form" action={createGalleryItem}><label>Title<input name="title" placeholder="A quiet afternoon" required /></label><label>Image URL<input name="imageUrl" type="url" placeholder="https://…" required /></label><label>Category<input name="category" placeholder="Selected work" /></label><label>Description<textarea name="description" placeholder="A short note about this frame" rows={3} /></label><button type="submit">Add to gallery <span>↗</span></button></form><div className="admin-list">{gallery.map((item) => <div className="admin-list-item" key={item.id}><div><strong>{item.title}</strong><span>{item.category}</span></div><form action={deleteGalleryItem.bind(null, item.id)}><button className="delete-button" type="submit">Remove</button></form></div>)}</div></section><section className="admin-panel settings-panel"><ProfileSettingsForm settings={settings} /></section></main>
}
