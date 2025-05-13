import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { getPlayerByUserId, updateGuildBattleDates } from '~/server/db/query';

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

    if (!player.guildId || !player.guild) {
      return NextResponse.json(
        {
          success: false,
          message: 'Player does not have guild',
        },
        { status: 404 },
      );
    }

    if (player.userId !== player.guild.ownerId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden',
        },
        { status: 403 },
      );
    }

    const { battleDates } = await request.json();

    if (!battleDates) {
      return NextResponse.json(
        {
          success: false,
          message: 'timeSlot is required',
        },
        { status: 400 },
      );
    }

    await updateGuildBattleDates(player.guildId, battleDates);
    return NextResponse.json(
      {
        success: true,
        message: 'Battle time slot data updated',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update battle time data',
      },
      { status: 500 },
    );
  }
}
