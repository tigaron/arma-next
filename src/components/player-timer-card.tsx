"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Play, Pause, RotateCcw, X, GripVertical } from "lucide-react"
import { type Player, COLOR_CONFIG } from "~/types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface PlayerTimerCardProps {
  player: Player
  timer: number
  isRunning: boolean
  canControl: boolean
  isAdmin: boolean
  onDelete: (playerId: string) => void
  onStart: (playerId: string) => void
  onPause: (playerId: string) => void
  onReset: (playerId: string) => void
  onAdjust: (playerId: string, seconds: number) => void
}

export function PlayerTimerCard({
  player,
  timer,
  isRunning,
  canControl,
  isAdmin,
  onDelete,
  onStart,
  onPause,
  onReset,
  onAdjust,
}: PlayerTimerCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
    data: {
      type: "player",
      player,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card ref={setNodeRef} style={style} className="relative">
      {isAdmin && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-500"
            onClick={() => onDelete(player.id)}
            aria-label={`Delete ${player.name}`}
          >
            <X className="h-4 w-4" />
          </Button>
          <div
            className={`absolute top-2 left-2 cursor-grab p-1 rounded ${COLOR_CONFIG[player.color].dragHandleClass}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>
        </>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg">{player.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        <div className="flex justify-center items-center">
          <div className="text-4xl font-mono font-bold tabular-nums">{formatTime(timer || 0)}</div>
        </div>

        {canControl && (
          <div className="space-y-2">
            <div className="flex justify-center items-center">
              <span className="text-sm text-muted-foreground mr-2">Decrease:</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjust(player.id, -1)}
                  disabled={timer <= 0}
                  aria-label="Decrease 1 second"
                  className="h-7 px-2"
                >
                  1s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjust(player.id, -5)}
                  disabled={timer < 5}
                  aria-label="Decrease 5 seconds"
                  className="h-7 px-2"
                >
                  5s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjust(player.id, -10)}
                  disabled={timer < 10}
                  aria-label="Decrease 10 seconds"
                  className="h-7 px-2"
                >
                  10s
                </Button>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <span className="text-sm text-muted-foreground mr-2">Increase:</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjust(player.id, 1)}
                  aria-label="Increase 1 second"
                  className="h-7 px-2"
                >
                  1s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjust(player.id, 5)}
                  aria-label="Increase 5 seconds"
                  className="h-7 px-2"
                >
                  5s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjust(player.id, 10)}
                  aria-label="Increase 10 seconds"
                  className="h-7 px-2"
                >
                  10s
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {canControl && (
        <CardFooter className="flex justify-center gap-2 pt-0">
          {!isRunning ? (
            <Button onClick={() => onStart(player.id)} size="sm" className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => onPause(player.id)}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1"
            >
              <Pause className="h-3 w-3" />
              Pause
            </Button>
          )}
          <Button onClick={() => onReset(player.id)} variant="outline" size="sm" className="flex items-center gap-1">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
