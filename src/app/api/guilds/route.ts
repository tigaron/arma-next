import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { getGuildById, getPlayerByUserId } from '~/server/db/query';

export async function GET() {
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
    if (!player) {
      return NextResponse.json(
        {
          success: false,
          message: 'Player not found',
        },
        { status: 404 },
      );
    }

    if (!player.guildId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Player does not have guild',
        },
        { status: 404 },
      );
    }

    const guild = await getGuildById(player.guildId);

    if (!guild) {
      return NextResponse.json(
        {
          success: false,
          message: 'Guild not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Guild data found',
        data: guild,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch player data',
      },
      { status: 500 },
    );
  }
}
