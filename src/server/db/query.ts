import 'server-only';

import { and, eq, gt, gte, sql } from 'drizzle-orm';
import type { DateRange } from 'react-day-picker';
import { db, redis } from '.';
import {
  type BattleSlot,
  type Color,
  battleSlots,
  colors,
  guilds,
  players,
  teams,
} from './schema';

export async function getBattleTimeSlots() {
  try {
    return await db.select().from(battleSlots);
  } catch (error) {
    console.error('Failed to get battle time slot from database');
    throw error;
  }
}

export async function getPlayerByGuildId(guildId: string) {
  try {
    return await db.query.players.findMany({
      where: eq(players.guildId, guildId),
      with: {
        user: true,
      },
    });
  } catch (error) {
    console.error('Failed to get player from database');
    throw error;
  }
}

export async function getPlayerByInviteToken(inviteToken: string) {
  try {
    return await db
      .select()
      .from(players)
      .where(eq(players.inviteToken, inviteToken));
  } catch (error) {
    console.error('Failed to get player from database');
    throw error;
  }
}

export async function getPlayerByUserId(userId: string) {
  try {
    return await db.query.players.findFirst({
      where: eq(players.userId, userId),
      with: {
        user: true,
      },
    });
  } catch (error) {
    console.error('Failed to get player from database');
    throw error;
  }
}

export async function createDefaultGuildForUserId(userId: string) {
  try {
    return await db.transaction(async (tx) => {
      let [battleSlot] = await tx.select().from(battleSlots).limit(1);

      if (!battleSlot) {
        const battleSlotLabels: BattleSlot['label'][] = [
          '21:00 – 22:00',
          '1:00 – 2:00',
          '4:00 – 5:00',
          '11:00 – 12:00',
        ];
        const battleSlotRows = battleSlotLabels.map((label) => ({
          label,
        }));

        const [newBattleSlot] = await tx
          .insert(battleSlots)
          .values(battleSlotRows)
          .returning();

        if (!newBattleSlot) {
          throw new Error('Failed to store guild in database');
        }

        battleSlot = newBattleSlot;
      }

      const [guild] = await tx
        .insert(guilds)
        .values({
          ownerId: userId,
          name: 'My Guild',
          battleSlotId: battleSlot.id,
          battleDates: { from: undefined, to: undefined },
        })
        .returning({
          id: guilds.id,
        });

      if (!guild) {
        throw new Error('Failed to store guild in database');
      }

      const [team] = await tx
        .insert(teams)
        .values({
          guildId: guild.id,
          name: 'Team 1',
          isDefault: true,
        })
        .returning({
          id: teams.id,
        });

      if (!team) {
        throw new Error('Failed to store guild in database');
      }

      const colorLabels: Color['label'][] = ['blue', 'yellow', 'green', 'red'];
      const colorRows = colorLabels.map((color, index) => ({
        label: color,
        teamId: team.id,
        position: index,
      }));

      const [newColor] = await tx.insert(colors).values(colorRows).returning({
        id: colors.id,
      });

      if (!newColor) {
        throw new Error('Failed to store guild in database');
      }

      const [player] = await tx
        .insert(players)
        .values({
          userId,
          guildId: guild.id,
          teamId: team.id,
          colorId: newColor.id,
          position: Number(0),
        })
        .returning();

      if (!player) {
        throw new Error('Failed to store guild in database');
      }

      const timerStateKey = `timer:${player.inviteToken}`;
      const timerDefaultState = JSON.stringify({
        duration: 300000,
        isRunning: false,
        pausedDuration: 0,
      });

      await redis.set(timerStateKey, timerDefaultState);

      const timerOwnerKey = `timer:${player.inviteToken}:owner`;
      const timerOwner = JSON.stringify({
        playerId: player.userId,
        guildOwner: player.userId,
      });

      await redis.set(timerOwnerKey, timerOwner);

      return player;
    });
  } catch (error) {
    console.error('Failed to store guild in database');
    throw error;
  }
}

export async function getTeamsByGuildId(guildId: string) {
  try {
    return await db.query.teams.findMany({
      where: eq(teams.guildId, guildId),
      with: {
        colors: {
          orderBy: (colors, { asc }) => [asc(colors.position)],
        },
      },
      orderBy: (teams, { asc }) => [asc(teams.createdAt)],
    });
  } catch (error) {
    console.error('Failed to get teams from database');
    throw error;
  }
}

export async function getGuildById(guildId: string) {
  try {
    return await db.query.guilds.findFirst({
      where: eq(guilds.id, guildId),
      with: {
        battleSlot: true,
      },
    });
  } catch (error) {
    console.error('Failed to get guild from database');
    throw error;
  }
}

export async function addTeamForGuildId(guildId: string, name: string) {
  try {
    return await db.transaction(async (tx) => {
      const [team] = await tx
        .insert(teams)
        .values({
          guildId,
          name,
        })
        .returning();

      if (!team) {
        throw new Error('Failed to store team in database');
      }

      const colorLabels: Color['label'][] = ['blue', 'yellow', 'green', 'red'];
      const colorRows = colorLabels.map((color, index) => ({
        label: color,
        teamId: team.id,
        position: index,
      }));

      const newColors = await tx.insert(colors).values(colorRows).returning();

      if (!newColors || newColors.length === 0) {
        throw new Error('Failed to store team in database');
      }

      return {
        ...team,
        colors: newColors,
      };
    });
  } catch (error) {
    console.error('Failed to store team in database');
    throw error;
  }
}

export async function addPlayerForGuildId(
  guildId: string,
  guildOwner: string,
  teamId: string,
  colorId: string,
  position: number,
) {
  try {
    const [player] = await db
      .insert(players)
      .values({
        guildId,
        teamId,
        colorId,
        position: Number(position),
      })
      .returning();

    if (!player) {
      throw new Error('Failed to store player in database');
    }

    const timerStateKey = `timer:${player.inviteToken}`;
    const timerDefaultState = JSON.stringify({
      duration: 300000,
      isRunning: false,
      pausedDuration: 0,
    });

    await redis.set(timerStateKey, timerDefaultState);

    const timerOwnerKey = `timer:${player.inviteToken}:owner`;
    const timerOwner = JSON.stringify({
      playerId: player.userId,
      guildOwner,
    });

    await redis.set(timerOwnerKey, timerOwner);

    return player;
  } catch (error) {
    console.error('Failed to store player in database');
    throw error;
  }
}

export async function addPlayerByInviteToken(
  inviteToken: string,
  userId: string,
) {
  try {
    const player = await db.query.players.findFirst({
      where: eq(players.inviteToken, inviteToken),
      with: {
        guild: {
          columns: {
            ownerId: true,
          },
        },
      },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    if (player.userId) {
      throw new Error('Player is already claimed');
    }

    if (!player.guild?.ownerId) {
      throw new Error('Guild not found');
    }

    const [claimedPlayer] = await db
      .update(players)
      .set({
        userId,
      })
      .where(eq(players.inviteToken, inviteToken))
      .returning();

    const timerStateKey = `timer:${inviteToken}`;
    const timerDefaultState = JSON.stringify({
      duration: 300000,
      isRunning: false,
      pausedDuration: 0,
    });

    await redis.set(timerStateKey, timerDefaultState);

    const timerOwnerKey = `timer:${inviteToken}:owner`;
    const timerOwner = JSON.stringify({
      playerId: userId,
      guildOwner: player.guild.ownerId,
    });

    await redis.set(timerOwnerKey, timerOwner);

    return claimedPlayer;
  } catch (error) {
    console.error('Failed to store player in database');
    throw error;
  }
}

export async function updateColorsOrderByTeamId(
  teamId: string,
  colorOrder: Color['label'][],
) {
  try {
    return await db.transaction(async (tx) => {
      for (const [index, value] of colorOrder.entries()) {
        await tx
          .update(colors)
          .set({ position: index })
          .where(eq(colors.id, value));
      }

      const [team] = await tx.query.teams.findMany({
        where: eq(teams.id, teamId),
        with: {
          colors: {
            orderBy: (colors, { asc }) => [asc(colors.position)],
          },
        },
      });

      if (!team) {
        throw new Error('Failed to fetch updated team from database');
      }

      return team;
    });
  } catch (error) {
    console.error('Failed to update colors order in database');
    throw error;
  }
}

export async function deletePlayerById(playerId: string) {
  try {
    await db.delete(players).where(eq(players.inviteToken, playerId));
    const timerStateKey = `timer:${playerId}`;
    const timerOwnerKey = `timer:${playerId}:owner`;
    await redis.del(timerStateKey);
    await redis.del(timerOwnerKey);
  } catch (error) {
    console.error('Failed to delete player from database');
    throw error;
  }
}

export async function checkIsDefaultTeam(teamsId: string) {
  try {
    return await db
      .select({ isDefault: teams.isDefault })
      .from(teams)
      .where(eq(teams.id, teamsId));
  } catch (error) {
    console.error('Failed to fetch team from database');
    throw error;
  }
}

export async function deleteTeamById(teamsId: string) {
  try {
    return await db.transaction(async (tx) => {
      const teamPlayers = await tx
        .select({ inviteToken: players.inviteToken })
        .from(players)
        .where(eq(players.teamId, teamsId));

      for (const player of teamPlayers) {
        const timerStateKey = `timer:${player.inviteToken}`;
        const timerOwnerKey = `timer:${player.inviteToken}:owner`;

        await redis.del(timerStateKey);
        await redis.del(timerOwnerKey);
      }

      await tx.delete(teams).where(eq(teams.id, teamsId));
    });
  } catch (error) {
    console.error('Failed to delete team from database or Redis');
    throw error;
  }
}

export async function updateGuildBattleSlotById(
  guildId: string,
  timeSlot: BattleSlot['label'],
) {
  try {
    const [battleSlot] = await db
      .select()
      .from(battleSlots)
      .where(eq(battleSlots.label, timeSlot));

    if (!battleSlot) {
      throw new Error('Failed to fetch battle slot data from database');
    }

    await db
      .update(guilds)
      .set({
        battleSlotId: battleSlot.id,
      })
      .where(eq(guilds.id, guildId));

    return battleSlot.label;
  } catch (error) {
    console.error('Failed to update guild in database');
    throw error;
  }
}

export async function updateGuildBattleDates(
  guildId: string,
  battleDates: DateRange,
) {
  try {
    return await db
      .update(guilds)
      .set({
        battleDates,
      })
      .where(eq(guilds.id, guildId));
  } catch (error) {
    console.error('Failed to update guild in database');
    throw error;
  }
}

export async function updatePlayerPositionById(
  playerId: string,
  targetTeamId: string,
  targetColorId: string,
  targetPosition: number,
) {
  try {
    return await db.transaction(async (tx) => {
      // Fetch the player being moved
      const [player] = await tx
        .select()
        .from(players)
        .where(eq(players.inviteToken, playerId));

      if (!player) {
        throw new Error('Player not found');
      }

      const {
        teamId: sourceTeamId,
        colorId: sourceColorId,
        position: sourcePosition,
      } = player;

      // Step 1: Adjust positions in the source team
      if (sourceTeamId && sourceColorId) {
        await tx
          .update(players)
          .set({ position: sql`${players.position} - 1` })
          .where(
            and(
              eq(players.teamId, sourceTeamId),
              eq(players.colorId, sourceColorId),
              gt(players.position, sourcePosition),
            ),
          );
      }

      // Step 2: Check if the target color has players
      const targetColorPlayers = await tx
        .select()
        .from(players)
        .where(
          and(
            eq(players.teamId, targetTeamId),
            eq(players.colorId, targetColorId),
          ),
        );

      if (targetColorPlayers.length > 0) {
        // Step 3: Adjust positions in the target team if players exist
        await tx
          .update(players)
          .set({ position: sql`${players.position} + 1` })
          .where(
            and(
              eq(players.teamId, targetTeamId),
              eq(players.colorId, targetColorId),
              gte(players.position, targetPosition),
            ),
          );
      }

      // Step 4: Move the player to the target team, color, and position
      await tx
        .update(players)
        .set({
          teamId: targetTeamId,
          colorId: targetColorId,
          position: targetPosition,
        })
        .where(eq(players.inviteToken, playerId));
    });
  } catch (error) {
    console.error('Failed to update player in database');
    throw error;
  }
}
