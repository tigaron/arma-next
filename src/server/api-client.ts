import type { DateRange } from 'react-day-picker';
import type { GuildBattleTimeSlot, PlayerColor } from '~/types';
import type { BattleSlot, Color, Guild, Player, Team } from './db/schema';

export interface TeamWithColors extends Team {
  colors: Color[];
}

export interface PlayerWithName extends Player {
  user: {
    name: string;
  };
}

export interface PlayerWithGuildOwner extends Player {
  guild: {
    ownerId: string;
    battleSlot: BattleSlot;
    battleDates: DateRange;
  };
}

export interface GuildWithBattleSlot extends Guild {
  battleSlot: BattleSlot;
}

export const fetchMe = async (): Promise<PlayerWithGuildOwner> => {
  const response = await fetch('/api/players/me');
  if (!response.ok) throw new Error('Failed to fetch me');
  const { data } = await response.json();
  return data;
};

export const fetchTeams = async (): Promise<TeamWithColors[]> => {
  const response = await fetch('/api/teams');
  if (!response.ok) throw new Error('Failed to fetch teams');
  const { data } = await response.json();
  return data;
};

export const fetchPlayers = async (): Promise<PlayerWithName[]> => {
  const response = await fetch('/api/players');
  if (!response.ok) throw new Error('Failed to fetch players');
  const { data } = await response.json();
  return data;
};

export const createDefaultGuild = async (): Promise<PlayerWithName> => {
  const response = await fetch('/api/guilds/default', {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to create default guild');
  const { data } = await response.json();
  return data;
};

export const joinGuildByInviteCode = async (
  inviteToken: string,
): Promise<PlayerWithName> => {
  const response = await fetch('/api/players/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteToken }),
  });
  if (!response.ok) throw new Error('Failed to create player');
  const { data } = await response.json();
  return data;
};

export const addTeamApi = async (name: string): Promise<TeamWithColors> => {
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to add team');
  const { data } = await response.json();
  return data;
};

export const addPlayerApi = async (playerData: {
  teamId: string;
  colorId: string;
  position: number;
}): Promise<PlayerWithName> => {
  const response = await fetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(playerData),
  });
  if (!response.ok) throw new Error('Failed to add player');
  const { data } = await response.json();
  return data;
};

export const updateColorOrderApi = async (
  teamId: string,
  colorOrder: PlayerColor[],
): Promise<TeamWithColors> => {
  const response = await fetch('/api/colors', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, colorOrder }),
  });
  if (!response.ok) throw new Error('Failed to update color order');
  const { data } = await response.json();
  return data;
};

export const deletePlayerApi = async (playerId: string): Promise<void> => {
  const response = await fetch(`/api/players?id=${playerId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete player');
};

export const fetchGuildBattleTimeSlot =
  async (): Promise<GuildWithBattleSlot> => {
    const response = await fetch('/api/guilds/times');
    if (!response.ok) throw new Error('Failed to fetch guild battle time slot');
    const { data } = await response.json();
    return data;
  };

export const updateGuildBattleTimeSlotApi = async (
  timeSlot: GuildBattleTimeSlot,
): Promise<GuildBattleTimeSlot> => {
  const response = await fetch('/api/guilds/times', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeSlot }),
  });
  if (!response.ok) throw new Error('Failed to update guild battle time slot');
  const data = await response.json();
  return data.timeSlot;
};

export const updateGuildBattleDatesApi = async (
  battleDates: DateRange,
): Promise<void> => {
  const response = await fetch('/api/guilds/dates', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ battleDates }),
  });
  if (!response.ok) throw new Error('Failed to update guild battle dates');
};

export const deleteTeamApi = async (teamId: string): Promise<void> => {
  const response = await fetch(`/api/teams?id=${teamId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete team');
};

export const movePlayerApi = async (
  playerId: string,
  teamId: string,
  colorId: string,
  position: number,
): Promise<Player> => {
  const response = await fetch('/api/players/move', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, teamId, colorId, position }),
  });
  if (!response.ok) throw new Error('Failed to move player');
  const { data } = await response.json();
  return data;
};
