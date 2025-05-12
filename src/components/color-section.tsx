"use client"

import { type PlayerColor, type Player, COLOR_CONFIG } from "~/types"
import { PlayerTimerCard } from "./player-timer-card"
import { AddPlayerForm } from "./add-player-form"
import { GripHorizontal } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

interface ColorSectionProps {
  teamId: string
  color: PlayerColor
  players: Player[]
  playerTimers: Record<string, number>
  isRunning: Record<string, boolean>
  isAdmin: boolean
  canControlTimer: (playerId: string) => boolean
  onDeletePlayer: (playerId: string) => void
  onStartTimer: (playerId: string) => void
  onPauseTimer: (playerId: string) => void
  onResetTimer: (playerId: string) => void
  onAdjustTimer: (playerId: string, seconds: number) => void
  onAddPlayer: (name: string, password: string, teamId: string, color: PlayerColor) => void
  showAddForm: boolean
  onShowAddForm: () => void
  onHideAddForm: () => void
}

export function ColorSection({
  teamId,
  color,
  players,
  playerTimers,
  isRunning,
  isAdmin,
  canControlTimer,
  onDeletePlayer,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onAdjustTimer,
  onAddPlayer,
  showAddForm,
  onShowAddForm,
  onHideAddForm,
}: ColorSectionProps) {
  // Ensure the color section is properly handling the drag events
  // Update the useSortable hook to ensure it's correctly set up
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${teamId}-${color}`,
    data: {
      type: "color",
      teamId,
      color,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  // Sort players by order if available
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order
    }
    return 0
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${COLOR_CONFIG[color].bgClass} rounded-md ${COLOR_CONFIG[color].borderClass} border overflow-hidden`}
    >
      {/* Make sure the drag handle is properly set up */}
      <div className={`${COLOR_CONFIG[color].headerBgClass} p-2 flex justify-between items-center`}>
        <h3 className={`font-medium ${COLOR_CONFIG[color].textClass}`}>
          {COLOR_CONFIG[color].label}
          <span className="ml-2 text-sm">({players.length})</span>
        </h3>
        {isAdmin && (
          <div
            className={`cursor-grab p-1 rounded ${COLOR_CONFIG[color].dragHandleClass}`}
            {...attributes}
            {...listeners}
          >
            <GripHorizontal className="h-4 w-4 text-gray-500" />
          </div>
        )}
      </div>

      <div className="p-3 space-y-4">
        <SortableContext items={sortedPlayers.map((player) => player.id)} strategy={verticalListSortingStrategy}>
          {sortedPlayers.map((player) => (
            <PlayerTimerCard
              key={player.id}
              player={player}
              timer={playerTimers[player.id] || 0}
              isRunning={isRunning[player.id] || false}
              canControl={canControlTimer(player.id)}
              isAdmin={isAdmin}
              onDelete={onDeletePlayer}
              onStart={onStartTimer}
              onPause={onPauseTimer}
              onReset={onResetTimer}
              onAdjust={onAdjustTimer}
            />
          ))}
        </SortableContext>

        {/* Add Player Button - Only visible to admin */}
        {isAdmin && (
          <div className="mt-4">
            <AddPlayerForm
              teamId={teamId}
              color={color}
              onAdd={onAddPlayer}
              onCancel={showAddForm ? onHideAddForm : onShowAddForm}
              isOpen={showAddForm}
            />
          </div>
        )}
      </div>
    </div>
  )
}
