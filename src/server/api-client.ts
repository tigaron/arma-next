import type { Team, Player, PlayerColor, GuildBattleTimeSlot } from "~/types"

// Teams API
export const fetchTeams = async (): Promise<Team[]> => {
  const response = await fetch("/api/dummy-teams")
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export const addTeamApi = async (name: string): Promise<Team> => {
  const response = await fetch("/api/dummy-teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) throw new Error("Failed to add team")
  return response.json()
}

export const updateTeamApi = async (team: Team): Promise<Team> => {
  const response = await fetch("/api/dummy-teams", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(team),
  })
  if (!response.ok) throw new Error("Failed to update team")
  return response.json()
}

export const updateColorOrderApi = async (teamId: string, colorOrder: PlayerColor[]): Promise<Team> => {
  const response = await fetch("/api/dummy-colors", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId: teamId, colorOrder }),
  })
  if (!response.ok) throw new Error("Failed to update color order")
  return response.json()
}

export const deleteTeamApi = async (teamId: string): Promise<void> => {
  const response = await fetch(`/api/dummy-teams?id=${teamId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete team")
}

// Players API
export const fetchPlayers = async (): Promise<Player[]> => {
  const response = await fetch("/api/dummy-players")
  if (!response.ok) throw new Error("Failed to fetch players")
  return response.json()
}

export const addPlayerApi = async (data: {
  name: string
  password: string
  teamId: string
  color: string
}): Promise<Player> => {
  const response = await fetch("/api/dummy-players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to add player")
  return response.json()
}

export const updatePlayersApi = async (players: Player[]): Promise<Player[]> => {
  const response = await fetch("/api/dummy-players", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(players),
  })
  if (!response.ok) throw new Error("Failed to update players")
  return response.json()
}

export const movePlayerApi = async (playerId: string, teamId: string, color: PlayerColor): Promise<Player> => {
  const response = await fetch("/api/dummy-players/move", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, teamId, color }),
  })
  if (!response.ok) throw new Error("Failed to move player")
  return response.json()
}

export const deletePlayerApi = async (playerId: string): Promise<void> => {
  const response = await fetch(`/api/dummy-players?id=${playerId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete player")
}

// Timers API
export const fetchTimers = async (): Promise<Record<string, number>> => {
  const response = await fetch("/api/dummy-timers")
  if (!response.ok) throw new Error("Failed to fetch timers")
  return response.json()
}

export const updateTimerApi = async ({ userId, time }: { userId: string; time: number }): Promise<void> => {
  const response = await fetch("/api/dummy-timers", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, time }),
  })
  if (!response.ok) throw new Error("Failed to update timer")
}

// Running Status API
export const fetchRunningStatus = async (): Promise<Record<string, boolean>> => {
  const response = await fetch("/api/dummy-running")
  if (!response.ok) throw new Error("Failed to fetch running status")
  return response.json()
}

export const updateRunningStatusApi = async ({
  userId,
  running,
}: {
  userId: string
  running: boolean
}): Promise<void> => {
  const response = await fetch("/api/dummy-running", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, running }),
  })
  if (!response.ok) throw new Error("Failed to update running status")
}

// Passwords API
export const fetchPasswords = async (): Promise<Record<string, string>> => {
  const response = await fetch("/api/dummy-passwords")
  if (!response.ok) throw new Error("Failed to fetch passwords")
  return response.json()
}

// Guild Battle API
export const fetchGuildBattleTimeSlot = async (): Promise<GuildBattleTimeSlot> => {
  const response = await fetch("/api/dummy-guild-battle")
  if (!response.ok) throw new Error("Failed to fetch guild battle time slot")
  const data = await response.json()
  return data.timeSlot
}

export const updateGuildBattleTimeSlotApi = async (timeSlot: GuildBattleTimeSlot): Promise<GuildBattleTimeSlot> => {
  const response = await fetch("/api/dummy-guild-battle", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timeSlot }),
  })
  if (!response.ok) throw new Error("Failed to update guild battle time slot")
  const data = await response.json()
  return data.timeSlot
}

export const fetchGuildBattleDates = async (): Promise<string[]> => {
  const response = await fetch("/api/dummy-guild-battle/dates")
  if (!response.ok) throw new Error("Failed to fetch guild battle dates")
  const data = await response.json()
  return data.dates
}

export const updateGuildBattleDatesApi = async (dates: string[]): Promise<string[]> => {
  const response = await fetch("/api/dummy-guild-battle/dates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dates }),
  })
  if (!response.ok) throw new Error("Failed to update guild battle dates")
  const data = await response.json()
  return data.dates
}
