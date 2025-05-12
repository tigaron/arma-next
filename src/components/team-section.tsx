"use client"

import { type Team, type PlayerColor, type Player, DEFAULT_TEAM_ID } from "~/types"
import { Button } from "~/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { ColorSection } from "./color-section"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"

interface TeamSectionProps {
  team: Team
  players: Player[]
  playerTimers: Record<string, number>
  isRunning: Record<string, boolean>
  isAdmin: boolean
  canControlTimer: (playerId: string) => boolean
  expanded: boolean
  onToggleExpand: () => void
  onDeleteTeam: (teamId: string) => void
  onDeletePlayer: (playerId: string) => void
  onStartTimer: (playerId: string) => void
  onPauseTimer: (playerId: string) => void
  onResetTimer: (playerId: string) => void
  onAdjustTimer: (playerId: string, seconds: number) => void
  onAddPlayer: (name: string, password: string, teamId: string, color: PlayerColor) => void
  showAddForm: { teamId: string; color: PlayerColor } | null
  onShowAddForm: (teamId: string, color: PlayerColor) => void
  onHideAddForm: () => void
}

export function TeamSection({
  team,
  players,
  playerTimers,
  isRunning,
  isAdmin,
  canControlTimer,
  expanded,
  onToggleExpand,
  onDeleteTeam,
  onDeletePlayer,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onAdjustTimer,
  onAddPlayer,
  showAddForm,
  onShowAddForm,
  onHideAddForm,
}: TeamSectionProps) {
  // Count total players in the team
  const countPlayersInTeam = () => {
    return players.filter((player) => player.teamId === team.id).length
  }

  // Get players for a specific color
  const getPlayersByColor = (color: PlayerColor) => {
    return players.filter((player) => player.teamId === team.id && player.color === color)
  }

  // Default color order if not specified
  const colorOrder = team.colorOrder || ["blue", "yellow", "green", "red"]

  // Create sortable items for the colors
  const colorItems = colorOrder.map((color) => `${team.id}-${color}`)

  return (
    <Collapsible open={expanded} onOpenChange={onToggleExpand} className="border rounded-lg p-2">
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 flex-1 justify-start p-2">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="font-medium">{team.name}</span>
            <span className="text-sm text-muted-foreground ml-2">({countPlayersInTeam()} players)</span>
          </Button>
        </CollapsibleTrigger>

        {isAdmin && team.id !== DEFAULT_TEAM_ID && (
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-500 ml-2"
            onClick={() => onDeleteTeam(team.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CollapsibleContent>
        <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <SortableContext items={colorItems} strategy={horizontalListSortingStrategy}>
            {/* Render colors in the order specified by colorOrder */}
            {colorOrder.map((color) => (
              <ColorSection
                key={`${team.id}-${color}`}
                teamId={team.id}
                color={color as PlayerColor}
                players={getPlayersByColor(color as PlayerColor)}
                playerTimers={playerTimers}
                isRunning={isRunning}
                isAdmin={isAdmin}
                canControlTimer={canControlTimer}
                onDeletePlayer={onDeletePlayer}
                onStartTimer={onStartTimer}
                onPauseTimer={onPauseTimer}
                onResetTimer={onResetTimer}
                onAdjustTimer={onAdjustTimer}
                onAddPlayer={onAddPlayer}
                showAddForm={showAddForm?.teamId === team.id && showAddForm?.color === color}
                onShowAddForm={() => onShowAddForm(team.id, color as PlayerColor)}
                onHideAddForm={onHideAddForm}
              />
            ))}
          </SortableContext>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
