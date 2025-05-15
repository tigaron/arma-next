import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import {
  getBattleTimeSlots,
  getGuildById,
  getPlayerByUserId,
  updateGuildBattleSlotById,
} from '~/server/db/query';

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

    const battleSlots = await getBattleTimeSlots();

    return NextResponse.json(
      {
        success: true,
        message: 'Battle slot data found',
        data: battleSlots,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 },
    );
  }
}

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

    const { timeSlot } = await request.json();

    if (!timeSlot) {
      return NextResponse.json(
        {
          success: false,
          message: 'timeSlot is required',
        },
        { status: 400 },
      );
    }

    const updatedTimeSlot = await updateGuildBattleSlotById(
      player.guildId,
      timeSlot,
    );
    return NextResponse.json(
      {
        success: true,
        message: 'Battle time slot data updated',
        data: updatedTimeSlot,
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
