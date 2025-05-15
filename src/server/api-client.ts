import type { DateRange } from 'react-day-picker';
import type { BattleSlot, Color, Guild, Player, Team, User } from './db/schema';

export interface TeamWithColors extends Team {
  colors: Color[];
}

export interface PlayerWithUser extends Player {
  user: User | null;
}

export interface GuildWithBattleSlot extends Guild {
  battleSlot: BattleSlot | null;
}

export const fetchMe = async (userId: string): Promise<PlayerWithUser> => {
  const response = await fetch(`/api/players/me?id=${userId}`);
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

export const fetchPlayers = async (): Promise<PlayerWithUser[]> => {
  const response = await fetch('/api/players');
  if (!response.ok) throw new Error('Failed to fetch players');
  const { data } = await response.json();
  return data;
};

export const createDefaultGuild = async () => {
  const response = await fetch('/api/guilds/default', {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to create default guild');
};

export const joinGuildByInviteCode = async (
  inviteToken: string,
): Promise<Player> => {
  const response = await fetch('/api/players/new', {
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
}) => {
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
  colorOrder: Color['label'][],
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

export const fetchBattleTimeSlots = async (): Promise<BattleSlot[]> => {
  const response = await fetch('/api/guilds/times');
  if (!response.ok) throw new Error('Failed to fetch battle time slot data');
  const { data } = await response.json();
  return data;
};

export const fetchGuild = async (
  guildId: string,
): Promise<GuildWithBattleSlot> => {
  const response = await fetch(`/api/guilds?guildId=${guildId}`);
  if (!response.ok) throw new Error('Failed to fetch guild data');
  const { data } = await response.json();
  return data;
};

export const updateGuildBattleTimeSlotApi = async (
  timeSlot: BattleSlot['label'],
) => {
  const response = await fetch('/api/guilds/times', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeSlot }),
  });
  if (!response.ok) throw new Error('Failed to update guild battle time slot');
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
