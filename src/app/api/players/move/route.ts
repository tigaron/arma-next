import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import {
  getGuildById,
  getPlayerByUserId,
  updatePlayerPositionById,
} from '~/server/db/query';

export async function PUT(request: Request) {
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

    if (player.userId !== guild.ownerId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden',
        },
        { status: 403 },
      );
    }

    const { playerId, teamId, colorId, position } = await request.json();

    if (
      !playerId ||
      !teamId ||
      !colorId ||
      position === null ||
      position === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'playerId, teamId, colorId, and position are required',
        },
        { status: 400 },
      );
    }

    await updatePlayerPositionById(playerId, teamId, colorId, position);
    return NextResponse.json(
      {
        success: true,
        message: 'Player data updated',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update colors data',
      },
      { status: 500 },
    );
  }
}
