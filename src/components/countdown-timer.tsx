"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Lock, Unlock } from "lucide-react"
import { AuthModal } from "./auth-modal"
import { AddTeamForm } from "./add-team-form"
import { TeamSection } from "./team-section"
import { GuildBattleTimer } from "./guild-battle-timer"
import {
  type Team,
  type PlayerColor,
  type AuthState,
  DEFAULT_TEAM_ID,
  DEFAULT_TIME,
  type GuildBattleTimeSlot,
} from "~/types"
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchTeams,
  fetchPlayers,
  fetchTimers,
  fetchRunningStatus,
  fetchPasswords,
  fetchGuildBattleTimeSlot,
  fetchGuildBattleDates,
  addTeamApi,
  updateTeamApi,
  updateColorOrderApi,
  deleteTeamApi,
  addPlayerApi,
  updatePlayersApi,
  movePlayerApi,
  deletePlayerApi,
  updateTimerApi,
  updateRunningStatusApi,
} from "~/server/api-client"

export function CountdownTimer() {
  const queryClient = useQueryClient()

  // Queries
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  })

  const { data: players = [] } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
  })

  const { data: playerTimers = {} } = useQuery({
    queryKey: ["timers"],
    queryFn: fetchTimers,
  })

  const { data: isRunning = {} } = useQuery({
    queryKey: ["running"],
    queryFn: fetchRunningStatus,
  })

  const { data: userPasswords = {} } = useQuery({
    queryKey: ["passwords"],
    queryFn: fetchPasswords,
  })

  const { data: guildBattleTimeSlot = "21:00 – 22:00" } = useQuery({
    queryKey: ["guildBattleTimeSlot"],
    queryFn: fetchGuildBattleTimeSlot,
  })

  const { data: guildBattleDates = [] } = useQuery({
    queryKey: ["guildBattleDates"],
    queryFn: fetchGuildBattleDates,
  })

  // Mutations
  const addTeamMutation = useMutation({
    mutationFn: addTeamApi,
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })

      // Auto-expand the new team
      setExpandedTeams((prev) => ({
        ...prev,
        [newTeam.id]: true,
      }))
    },
  })

  const updateTeamMutation = useMutation({
    mutationFn: updateTeamApi,
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData(["teams"], (oldTeams: Team[] = []) => {
        return oldTeams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
      })
    },
  })

  const updateColorOrderMutation = useMutation({
    mutationFn: ({ teamId, colorOrder }: { teamId: string; colorOrder: PlayerColor[] }) =>
      updateColorOrderApi(teamId, colorOrder),
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData(["teams"], (oldTeams: Team[] = []) => {
        return oldTeams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
      })
    },
  })

  const deleteTeamMutation = useMutation({
    mutationFn: deleteTeamApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["players"] })
    },
  })

  const addPlayerMutation = useMutation({
    mutationFn: addPlayerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] })
      queryClient.invalidateQueries({ queryKey: ["timers"] })
      queryClient.invalidateQueries({ queryKey: ["running"] })
      queryClient.invalidateQueries({ queryKey: ["passwords"] })
    },
  })

  const updatePlayersMutation = useMutation({
    mutationFn: updatePlayersApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] })
    },
  })

  const movePlayerMutation = useMutation({
    mutationFn: ({ playerId, teamId, color }: { playerId: string; teamId: string; color: PlayerColor }) =>
      movePlayerApi(playerId, teamId, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] })
    },
  })

  const deletePlayerMutation = useMutation({
    mutationFn: deletePlayerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] })
      queryClient.invalidateQueries({ queryKey: ["timers"] })
      queryClient.invalidateQueries({ queryKey: ["running"] })
      queryClient.invalidateQueries({ queryKey: ["passwords"] })
    },
  })

  const updateTimerMutation = useMutation({
    mutationFn: updateTimerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timers"] })
    },
  })

  const updateRunningStatusMutation = useMutation({
    mutationFn: updateRunningStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["running"] })
    },
  })

  const [showAddTeamForm, setShowAddTeamForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState<{ teamId: string; color: PlayerColor } | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authState, setAuthState] = useState<AuthState>({ role: "guest" })
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({ [DEFAULT_TEAM_ID]: true })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDragData, setActiveDragData] = useState<any>(null)
  const timerIntervals = useRef<Record<string, NodeJS.Timeout>>({})

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(timerIntervals.current).forEach((interval) => {
        clearInterval(interval)
      })
    }
  }, [])

  const startTimer = (playerId: string) => {
    // Clear any existing interval
    if (timerIntervals.current[playerId]) {
      clearInterval(timerIntervals.current[playerId])
    }

    // Update running status in the API
    updateRunningStatusMutation.mutate({ userId: playerId, running: true })

    // Optimistically update the UI
    queryClient.setQueryData(["running"], (prev: Record<string, boolean> = {}) => ({
      ...prev,
      [playerId]: true,
    }))

    timerIntervals.current[playerId] = setInterval(() => {
      // Get the current timer value
      const currentTimers = queryClient.getQueryData<Record<string, number>>(["timers"]) || {}
      const currentTime = currentTimers[playerId] || 0

      if (currentTime <= 0) {
        clearInterval(timerIntervals.current[playerId])
        updateRunningStatusMutation.mutate({ userId: playerId, running: false })
        return
      }

      // Update the timer value
      const newTime = currentTime - 1
      updateTimerMutation.mutate({ userId: playerId, time: newTime })

      // Optimistically update the UI
      queryClient.setQueryData(["timers"], (prev: Record<string, number> = {}) => ({
        ...prev,
        [playerId]: newTime,
      }))
    }, 1000)
  }

  const pauseTimer = (playerId: string) => {
    clearInterval(timerIntervals.current[playerId])
    updateRunningStatusMutation.mutate({ userId: playerId, running: false })
  }

  const resetTimer = (playerId: string) => {
    clearInterval(timerIntervals.current[playerId])
    updateTimerMutation.mutate({ userId: playerId, time: DEFAULT_TIME })
    updateRunningStatusMutation.mutate({ userId: playerId, running: false })
  }

  const adjustTimer = (playerId: string, seconds: number) => {
    const currentTimers = queryClient.getQueryData<Record<string, number>>(["timers"]) || {}
    const currentTime = currentTimers[playerId] || 0
    const newTime = Math.max(0, currentTime + seconds)

    updateTimerMutation.mutate({ userId: playerId, time: newTime })
  }

  const addPlayer = (name: string, password: string, teamId: string, color: PlayerColor) => {
    addPlayerMutation.mutate({ name, password, teamId, color })
    setShowAddForm(null)
  }

  const addTeam = (name: string) => {
    addTeamMutation.mutate(name)
    setShowAddTeamForm(false)
  }

  const deletePlayer = (playerId: string) => {
    // Clear any running interval
    if (timerIntervals.current[playerId]) {
      clearInterval(timerIntervals.current[playerId])
      delete timerIntervals.current[playerId]
    }

    deletePlayerMutation.mutate(playerId)
  }

  const deleteTeam = (teamId: string) => {
    // Don't allow deleting the default team
    if (teamId === DEFAULT_TEAM_ID) return

    deleteTeamMutation.mutate(teamId)

    // Remove from expanded teams
    setExpandedTeams((prev) => {
      const newExpanded = { ...prev }
      delete newExpanded[teamId]
      return newExpanded
    })
  }

  // Check if user has permission to control a specific timer
  const canControlTimer = (playerId: string): boolean => {
    if (authState.role === "admin") return true
    if (authState.role === "user" && authState.userId === playerId) return true
    return false
  }

  // Check if user has admin permissions
  const isAdmin = (): boolean => {
    return authState.role === "admin"
  }

  const toggleTeamExpanded = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }))
  }

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setActiveDragData(event.active.data.current)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      setActiveDragData(null)
      return
    }

    if (active.id !== over.id) {
      const activeData = active.data.current
      const overData = over.data.current

      // Handle player reordering within a color
      if (activeData?.type === "player" && overData?.type === "player") {
        const activePlayer = activeData.player
        const overPlayer = overData.player

        // If in the same team and color, just reorder
        if (activePlayer.teamId === overPlayer.teamId && activePlayer.color === overPlayer.color) {
          const filteredPlayers = players.filter(
            (u) => u.teamId === activePlayer.teamId && u.color === activePlayer.color,
          )

          const oldIndex = filteredPlayers.findIndex((u) => u.id === activePlayer.id)
          const newIndex = filteredPlayers.findIndex((u) => u.id === overPlayer.id)

          const reorderedPlayers = arrayMove(filteredPlayers, oldIndex, newIndex)

          // Update orders
          const updatedPlayers = players.map((player) => {
            if (player.teamId === activePlayer.teamId && player.color === activePlayer.color) {
              const reorderedPlayer = reorderedPlayers.find((u) => u.id === player.id)
              if (reorderedPlayer) {
                return {
                  ...player,
                  order: reorderedPlayers.indexOf(reorderedPlayer),
                }
              }
            }
            return player
          })

          updatePlayersMutation.mutate(updatedPlayers)
        } else {
          // Move player to a different team or color
          movePlayerMutation.mutate({
            playerId: activePlayer.id,
            teamId: overPlayer.teamId,
            color: overPlayer.color,
          })

          // Optimistically update the UI
          queryClient.setQueryData(["players"], (prevPlayers: any[] = []) => {
            return prevPlayers.map((player) =>
              player.id === activePlayer.id
                ? { ...player, teamId: overPlayer.teamId, color: overPlayer.color }
                : player,
            )
          })
        }
      }

      // Handle player being dropped on a color section
      if (activeData?.type === "player" && overData?.type === "color") {
        const activePlayer = activeData.player
        const targetTeamId = overData.teamId
        const targetColor = overData.color

        // Move player to the target team and color
        movePlayerMutation.mutate({
          playerId: activePlayer.id,
          teamId: targetTeamId,
          color: targetColor,
        })

        // Optimistically update the UI
        queryClient.setQueryData(["players"], (prevPlayers: any[] = []) => {
          return prevPlayers.map((player) =>
            player.id === activePlayer.id ? { ...player, teamId: targetTeamId, color: targetColor } : player,
          )
        })
      }

      // Handle color reordering within a team
      if (activeData?.type === "color" && overData?.type === "color") {
        const activeTeamId = activeData.teamId
        const overTeamId = overData.teamId
        const activeColor = activeData.color
        const overColor = overData.color

        // Only reorder if in the same team
        if (activeTeamId === overTeamId) {
          const team = teams.find((g) => g.id === activeTeamId)

          if (team) {
            const colorOrder = [...(team.colorOrder || ["blue", "yellow", "green", "red"])]
            const oldIndex = colorOrder.indexOf(activeColor)
            const newIndex = colorOrder.indexOf(overColor)

            if (oldIndex !== -1 && newIndex !== -1) {
              const newColorOrder = arrayMove(colorOrder, oldIndex, newIndex)

              // Update color order via dedicated API
              updateColorOrderMutation.mutate({
                teamId: activeTeamId,
                colorOrder: newColorOrder,
              })

              // Optimistically update the UI
              queryClient.setQueryData(["teams"], (prevTeams: Team[] = []) => {
                return prevTeams.map((t) => (t.id === team.id ? { ...t, colorOrder: newColorOrder } : t))
              })
            }
          }
        }
      }
    }

    setActiveId(null)
    setActiveDragData(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Armageddon Battle Timer</h2>
        <Button variant="outline" onClick={() => setAuthModalOpen(true)} className="flex items-center gap-2">
          {authState.role === "guest" ? (
            <>
              <Lock className="h-4 w-4" />
              <span>Sign In</span>
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              <span>{authState.role === "admin" ? "Admin" : `Player ${authState.userId}`}</span>
            </>
          )}
        </Button>
      </div>

      {/* Guild Battle Timer */}
      <GuildBattleTimer
        timeSlot={guildBattleTimeSlot as GuildBattleTimeSlot}
        battleDates={guildBattleDates}
        isAdmin={isAdmin()}
      />

      {/* Admin Add Team Button */}
      {isAdmin() && (
        <div className="mb-4">
          <AddTeamForm onAdd={addTeam} onCancel={() => setShowAddTeamForm(!showAddTeamForm)} isOpen={showAddTeamForm} />
        </div>
      )}

      {/* Teams */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {teams.map((team) => (
            <TeamSection
              key={team.id}
              team={team}
              players={players.filter((player) => player.teamId === team.id)}
              playerTimers={playerTimers}
              isRunning={isRunning}
              isAdmin={isAdmin()}
              canControlTimer={canControlTimer}
              expanded={expandedTeams[team.id] || false}
              onToggleExpand={() => toggleTeamExpanded(team.id)}
              onDeleteTeam={deleteTeam}
              onDeletePlayer={deletePlayer}
              onStartTimer={startTimer}
              onPauseTimer={pauseTimer}
              onResetTimer={resetTimer}
              onAdjustTimer={adjustTimer}
              onAddPlayer={addPlayer}
              showAddForm={showAddForm}
              onShowAddForm={(teamId, color) => setShowAddForm({ teamId, color })}
              onHideAddForm={() => setShowAddForm(null)}
            />
          ))}
        </div>

        {/* Drag overlay for preview */}
        <DragOverlay>
          {activeId && activeDragData?.type === "player" && (
            <div className="opacity-50 bg-gray-100 border border-gray-300 rounded p-2">
              Dragging: {activeDragData.player.name}
            </div>
          )}
          {activeId && activeDragData?.type === "color" && (
            <div className="opacity-50 bg-gray-100 border border-gray-300 rounded p-2">
              Dragging: {activeDragData.color} section
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onAuth={setAuthState}
        userPasswords={userPasswords}
      />
    </div>
  )
}
