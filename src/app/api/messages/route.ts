import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const DATA_FILE = path.join(process.cwd(), 'data', 'messages.json');
const ADMIN_EMAIL = 'admin@lamirkohsa.dev';
const ADMIN_PASSWORD = 'ashokrimal#9847177515';

async function readMessages() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data) as any[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeMessages(messages: unknown[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), 'utf8');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const messages = await readMessages();
    const newEntry = {
      id: crypto.randomUUID(),
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };
    messages.unshift(newEntry);
    await writeMessages(messages);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving message', error);
    return NextResponse.json({ error: 'Failed to save message.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [email, password] = decoded.split(':');

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = await readMessages();
    return NextResponse.json(messages, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error reading messages', error);
    return NextResponse.json({ error: 'Failed to read messages.' }, { status: 500 });
  }
}
