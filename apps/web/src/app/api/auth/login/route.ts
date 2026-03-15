import { NextResponse } from 'next/server';
import { createSession } from '@/lib/server/demo-session';

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email: string };
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { session, profile } = await createSession(email);
    return NextResponse.json({ session, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
