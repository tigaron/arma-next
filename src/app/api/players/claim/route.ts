import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { addPlayerByInviteToken, getPlayerByUserId } from '~/server/db/query';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    const player = await getPlayerByUserId(session.user.id);
    if (player) {
      return NextResponse.json(
        {
          success: false,
          message: 'Player already have a guild',
        },
        { status: 409 },
      );
    }

    const { inviteToken } = await request.json();
    if (!inviteToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'inviteToken is required',
        },
        { status: 400 },
      );
    }

    const newPlayer = await addPlayerByInviteToken(
      inviteToken,
      session.user.id,
    );

    return NextResponse.json(
      {
        success: true,
        message: 'New player created',
        data: newPlayer,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create new player',
      },
      { status: 500 },
    );
  }
}
