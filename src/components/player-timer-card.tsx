'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pause, Play, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { useSocket } from '~/providers/socket-provider';
import type { PlayerWithName } from '~/server/api-client';
import { COLOR_CONFIG, type PlayerColor } from '~/types';

interface PlayerTimerCardProps {
  player: PlayerWithName;
  colorLabel: PlayerColor;
  isAdmin: boolean;
  onDelete: (playerId: string) => void;
}

interface TimerState {
  duration: number;
  isRunning: boolean;
  startTimestamp?: number;
  pausedDuration?: number;
  canControl: boolean;
}

export function PlayerTimerCard({
  player,
  colorLabel,
  isAdmin,
  onDelete,
}: PlayerTimerCardProps) {
  const socket = useSocket();

  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.emit('room:join', { roomId: player.inviteToken });

    socket.on(`timer:${player.inviteToken}:update`, (state: TimerState) => {
      setTimerState(state);
    });

    return () => {
      socket.off(`timer:${player.inviteToken}:update`);
    };
  }, [socket, player.inviteToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!timerState) return;

      const now = Date.now();
      let remaining = 0;

      if (timerState.isRunning && timerState.startTimestamp) {
        const elapsed = now - timerState.startTimestamp;
        remaining = timerState.duration - elapsed;
      } else {
        remaining = timerState.duration - (timerState.pausedDuration ?? 0);
      }

      const newTimeLeft = Math.max(0, remaining);
      setTimeLeft(newTimeLeft);

      // Reset the timer if it reaches 0
      if (newTimeLeft === 0 && timerState.isRunning) {
        sendControl('reset');
      }
    }, 250); // use 250ms for better display

    return () => clearInterval(interval);
  }, [timerState]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: player.inviteToken,
    data: {
      type: 'player',
      ...player,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Control buttons for owner only — assumes server enforces that
  const sendControl = (
    action: 'start' | 'pause' | 'reset' | 'increase' | 'decrease',
    value?: number,
  ) => {
    socket?.emit('timer:control', {
      roomId: player.inviteToken,
      action,
      value,
    });
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative">
      {isAdmin && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-500"
            onClick={() => onDelete(player.inviteToken)}
            aria-label={`Delete ${player.user?.name ?? player.inviteToken}`}
          >
            <X className="h-4 w-4" />
          </Button>
          <div
            className={`absolute top-2 left-2 cursor-grab rounded p-1 ${COLOR_CONFIG[colorLabel].dragHandleClass}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>
        </>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg">
          {player.user?.name ?? player.inviteToken}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        <div className="flex items-center justify-center">
          <div className="font-bold font-mono text-4xl tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </div>

        {timerState?.canControl && (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <span className="mr-2 text-muted-foreground text-sm">
                Decrease:
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('decrease', 1)}
                  disabled={timeLeft <= 0}
                  aria-label="Decrease 1 second"
                  className="h-7 px-2"
                >
                  1s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('decrease', 5)}
                  disabled={timeLeft < 5000}
                  aria-label="Decrease 5 seconds"
                  className="h-7 px-2"
                >
                  5s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('decrease', 10)}
                  disabled={timeLeft < 10000}
                  aria-label="Decrease 10 seconds"
                  className="h-7 px-2"
                >
                  10s
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <span className="mr-2 text-muted-foreground text-sm">
                Increase:
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('increase', 1)}
                  aria-label="Increase 1 second"
                  className="h-7 px-2"
                >
                  1s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('increase', 5)}
                  aria-label="Increase 5 seconds"
                  className="h-7 px-2"
                >
                  5s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('increase', 10)}
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

      {timerState?.canControl && (
        <CardFooter className="flex justify-center gap-2 pt-0">
          {timerState && !timerState.isRunning ? (
            <Button
              onClick={() => sendControl('start')}
              size="sm"
              className="flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => sendControl('pause')}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1"
            >
              <Pause className="h-3 w-3" />
              Pause
            </Button>
          )}
          <Button
            onClick={() => sendControl('reset')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
