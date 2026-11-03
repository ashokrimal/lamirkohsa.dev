import { getToken } from '@vercel/connect'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { galleryItem } from '@/lib/db/schema'
import { put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'

const connector = 'google/gallery-photo-imports'
async function getDrive() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) throw new Error('Unauthorized'); const token = await getToken(connector, { subject: { type: 'user', id: session.user.id } }); const client = new google.auth.OAuth2(); client.setCredentials({ access_token: token }); return { drive: google.drive({ version: 'v3', auth: client }), userId: session.user.id } }

export async function GET() { try { const { drive } = await getDrive(); const result = await drive.files.list({ q: "trashed = false and mimeType contains 'image/'", pageSize: 50, orderBy: 'modifiedTime desc', fields: 'files(id,name,mimeType,thumbnailLink,modifiedTime)' }); return NextResponse.json({ files: result.data.files ?? [] }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Google Drive is not available.' }, { status: 500 }) } }

export async function POST(request: Request) { try { const { drive, userId } = await getDrive(); const body = await request.json() as { fileId?: string; title?: string; category?: string }; if (!body.fileId) return NextResponse.json({ error: 'Missing Drive file.' }, { status: 400 }); const metadata = await drive.files.get({ fileId: body.fileId, fields: 'name,mimeType' }); const media = await drive.files.get({ fileId: body.fileId, alt: 'media' }, { responseType: 'arraybuffer' }); const fileName = metadata.data.name || `drive-${Date.now()}.jpg`; const blob = await put(`gallery/${userId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '-')}`, Buffer.from(media.data as ArrayBuffer), { access: 'public', contentType: metadata.data.mimeType || 'image/jpeg' }); const title = body.title?.trim() || null; const slug = `${title || 'photo'}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); await db.insert(galleryItem).values({ userId, title, slug, description: null, imageUrl: blob.url, category: body.category?.trim() || 'Selected work', featured: false, published: true }); revalidatePath('/gallery'); revalidatePath('/media'); return NextResponse.json({ url: blob.url }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Drive import failed.' }, { status: 500 }) } }
