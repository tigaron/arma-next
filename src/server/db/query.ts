import 'server-only';

import {
  guilds,
  players,
  teams,
} from './schema';
import { db } from '.';
import { eq } from 'drizzle-orm';

export async function getPlayerByUserId(id: string) {
  try {
    return await db
      .select()
      .from(players)
      .where(eq(players.userId, id))
  } catch (error) {
    console.error("Failed to get player from database");
    throw error;
  }
}

export async function createDefaultGuildForUserId(id: string) {
  try {
    return await db.transaction(async (tx) => {
      const [guild] = await tx
        .insert(guilds)
        .values({
          id,
          name: "My Guild",
        })
        .returning({
          id: guilds.id,
        });

      if (!guild) {
        throw new Error("Failed to store guild in database");
      }

      const [team] = await tx
        .insert(teams)
        .values({
          guildId: guild.id,
          name: "My Team",
        })
        .returning({
          id: teams.id,
        });

      if (!team) {
        throw new Error("Failed to store team in database");
      }

      const [player] = await tx
        .insert(players)
        .values({
          userId: id,
          guildId: guild.id,
          teamId: team.id,
        })
        .returning();

      if (!player) {
        throw new Error("Failed to store player in database");
      }

      return player;
    });
  } catch (error) {
    console.error("Failed to store guild in database");
    throw error;
  }
}
