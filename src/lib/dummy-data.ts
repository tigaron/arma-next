import { type Team, type Player, DEFAULT_TEAM_ID, GUILD_BATTLE_TIME_SLOTS } from "~/types"

// Initial user passwords
export const INITIAL_USER_PASSWORDS: Record<string, string> = {
  "1": "user1",
  "2": "user2",
  "3": "user3",
}

export const DEFAULT_TEAMS: Team[] = [
  {
    id: DEFAULT_TEAM_ID,
    name: "Default Team",
    colorOrder: ["blue", "yellow", "green", "red"],
  },
]

export const DEFAULT_PLAYERS: Player[] = [
  { id: "1", name: "Player 1", teamId: DEFAULT_TEAM_ID, color: "blue", order: 0 },
  { id: "2", name: "Player 2", teamId: DEFAULT_TEAM_ID, color: "yellow", order: 0 },
  { id: "3", name: "Player 3", teamId: DEFAULT_TEAM_ID, color: "green", order: 0 },
]

// Default timer value in seconds
export const DEFAULT_TIME = 5 * 60 // 5 minutes

// Guild Battle settings
let guildBattleTimeSlot: string | undefined = undefined // Default to undefined

// Default to empty dates array
let guildBattleDates: string[] = []

// Mock database
let teams = [...DEFAULT_TEAMS]
let players = [...DEFAULT_PLAYERS]
let playerTimers: Record<string, number> = {}
let isRunning: Record<string, boolean> = {}
let userPasswords = { ...INITIAL_USER_PASSWORDS }

// Initialize timers
DEFAULT_PLAYERS.forEach((player) => {
  playerTimers[player.id] = DEFAULT_TIME
  isRunning[player.id] = false
})

// API functions
export async function getTeams(): Promise<Team[]> {
  return [...teams]
}

export async function getPlayers(): Promise<Player[]> {
  return [...players]
}

export async function getPlayerTimers(): Promise<Record<string, number>> {
  return { ...playerTimers }
}

export async function getRunningStatus(): Promise<Record<string, boolean>> {
  return { ...isRunning }
}

export async function getUserPasswords(): Promise<Record<string, string>> {
  return { ...userPasswords }
}

export async function getGuildBattleTimeSlot(): Promise<string | undefined> {
  return guildBattleTimeSlot
}

export async function setGuildBattleTimeSlot(timeSlot: string): Promise<string> {
  if (GUILD_BATTLE_TIME_SLOTS.includes(timeSlot as any)) {
    guildBattleTimeSlot = timeSlot as any
  }
  return guildBattleTimeSlot as string
}

export async function getGuildBattleDates(): Promise<string[]> {
  return [...guildBattleDates]
}

export async function setGuildBattleDates(dates: string[]): Promise<string[]> {
  // Validate dates (ensure they're valid date strings)
  const validDates = dates.filter((date) => !isNaN(new Date(date).getTime()))

  // Sort dates chronologically
  validDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  // Limit to 3 dates
  guildBattleDates = validDates.slice(0, 3)

  return [...guildBattleDates]
}

export async function addTeam(name: string): Promise<Team> {
  const newTeam: Team = {
    id: crypto.randomUUID(),
    name,
    colorOrder: ["blue", "yellow", "green", "red"], // Ensure colorOrder is set
  }
  teams = [...teams, newTeam]
  return newTeam
}

export async function updateTeam(updatedTeam: Team): Promise<Team> {
  // Ensure colorOrder is present
  if (!updatedTeam.colorOrder) {
    updatedTeam.colorOrder = ["blue", "yellow", "green", "red"]
  }

  teams = teams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
  return updatedTeam
}

export async function updateColorOrder(teamId: string, colorOrder: string[]): Promise<Team> {
  const team = teams.find((g) => g.id === teamId)

  if (!team) {
    throw new Error(`Team with ID ${teamId} not found`)
  }

  const updatedTeam = {
    ...team,
    colorOrder,
  }

  teams = teams.map((g) => (g.id === teamId ? updatedTeam : g))
  return updatedTeam
}

export async function deleteTeam(teamId: string): Promise<void> {
  if (teamId === DEFAULT_TEAM_ID) return

  // Move all players from this team to the default team
  players = players.map((player) => (player.teamId === teamId ? { ...player, teamId: DEFAULT_TEAM_ID } : player))

  // Remove the team
  teams = teams.filter((team) => team.id !== teamId)
}

export async function addPlayer(name: string, password: string, teamId: string, color: string): Promise<Player> {
  // Find the highest order for this color and team
  const maxOrder = Math.max(
    0,
    ...players.filter((u) => u.teamId === teamId && u.color === color).map((u) => u.order || 0),
  )

  const newPlayer: Player = {
    id: crypto.randomUUID(),
    name,
    teamId,
    color: color as any,
    order: maxOrder + 1,
  }

  players = [...players, newPlayer]
  playerTimers[newPlayer.id] = DEFAULT_TIME
  isRunning[newPlayer.id] = false
  userPasswords[newPlayer.id] = password

  return newPlayer
}

export async function updatePlayers(updatedPlayers: Player[]): Promise<Player[]> {
  players = updatedPlayers
  return players
}

export async function updatePlayer(playerId: string, updates: Partial<Player>): Promise<Player> {
  const playerIndex = players.findIndex((p) => p.id === playerId)

  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  const updatedPlayer = {
    ...players[playerIndex],
    ...updates,
  }

  players[playerIndex] = updatedPlayer
  return updatedPlayer
}

export async function deletePlayer(playerId: string): Promise<void> {
  players = players.filter((player) => player.id !== playerId)

  // Clean up related data
  delete playerTimers[playerId]
  delete isRunning[playerId]
  delete userPasswords[playerId]
}

export async function updateTimer(playerId: string, time: number): Promise<void> {
  playerTimers[playerId] = time
}

export async function updateRunningStatus(playerId: string, running: boolean): Promise<void> {
  isRunning[playerId] = running
}

export async function resetAllData(): Promise<void> {
  teams = [...DEFAULT_TEAMS]
  players = [...DEFAULT_PLAYERS]
  playerTimers = {}
  isRunning = {}
  userPasswords = { ...INITIAL_USER_PASSWORDS }

  DEFAULT_PLAYERS.forEach((player) => {
    playerTimers[player.id] = DEFAULT_TIME
    isRunning[player.id] = false
  })
}

// Alias functions to maintain compatibility between "team" and "group" terminology
export const getGroups = getTeams
export const addGroup = addTeam
export const updateGroup = updateTeam
export const deleteGroup = deleteTeam

export const getUsers = getPlayers
export const addUser = addPlayer
export const updateUsers = updatePlayers
export const deleteUser = deletePlayer

// Guild Battle Days functions
export const getGuildBattleDays = getGuildBattleDates
export const setGuildBattleDays = setGuildBattleDates
