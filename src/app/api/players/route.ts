import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import {
  addPlayerForGuildId,
  deletePlayerById,
  getPlayerByGuildId,
  getPlayerByInviteToken,
  getPlayerByUserId,
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

    const players = await getPlayerByGuildId(player.guildId);

    if (!players || players.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Guild does not have any player',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Players data found',
        data: players,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch players data',
      },
      { status: 500 },
    );
  }
}

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

    const { teamId, colorId, position } = await request.json();
    if (!teamId || !colorId || position === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'teamId, colorId, and position are required',
        },
        { status: 400 },
      );
    }

    const newPlayer = await addPlayerForGuildId(
      player.guildId,
      player.guild.ownerId,
      teamId,
      colorId,
      position,
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

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'id is required',
        },
        { status: 400 },
      );
    }

    const [playerToDelete] = await getPlayerByInviteToken(id)
    if (player.guild.ownerId === playerToDelete?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Guild owner cannot be deleted',
        },
        { status: 403 },
      );
    }

    await deletePlayerById(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Player deleted',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete player data',
      },
      { status: 500 },
    );
  }
}
