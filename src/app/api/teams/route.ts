import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import {
  addTeamForGuildId,
  checkIsDefaultTeam,
  deleteTeamById,
  getGuildById,
  getPlayerByUserId,
  getTeamsByGuildId,
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

    if (!player.guildId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Player does not have guild',
        },
        { status: 404 },
      );
    }

    const teams = await getTeamsByGuildId(player.guildId);

    if (!teams || teams.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Guild does not have any team',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Teams data found',
        data: teams,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch teams data',
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

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: 'name is required',
        },
        { status: 400 },
      );
    }

    const newTeam = await addTeamForGuildId(player.guildId, name);
    return NextResponse.json(
      {
        success: true,
        message: 'New team created',
        data: newTeam,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create team',
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

    const [checkResult] = await checkIsDefaultTeam(id);
    if (!checkResult) {
      return NextResponse.json(
        {
          success: false,
          message: 'Team not found',
        },
        { status: 404 },
      );
    }

    if (checkResult.isDefault) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete default team',
        },
        { status: 403 },
      );
    }

    await deleteTeamById(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Team deleted',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete team',
      },
      { status: 500 },
    );
  }
}
