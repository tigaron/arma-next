import { sign } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { env } from '~/env';
import { auth } from '~/server/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = sign(
    { id: session.user.id },
    env.AUTH_SECRET, // shared with Socket.IO server
    { expiresIn: '1h' },
  );

  return NextResponse.json({ token });
}
