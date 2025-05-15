'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation } from '@tanstack/react-query';
import {
  CopyIcon,
  GripVertical,
  Pause,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { COLOR_CONFIG } from '~/lib/constants';
import { useSocket } from '~/providers/socket-provider';
import { type PlayerWithUser, deletePlayerApi } from '~/server/api-client';
import type { Color } from '~/server/db/schema';

interface PlayerTimerCardProps {
  currentUserId: string;
  ownerId: string;
  player: PlayerWithUser;
  colorLabel: Color['label'];
}

interface TimerState {
  duration: number;
  isRunning: boolean;
  startTimestamp?: number;
  pausedDuration?: number;
}

export function PlayerTimerCard({
  currentUserId,
  ownerId,
  player,
  colorLabel,
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

  const deletePlayerMutation = useMutation({
    mutationFn: deletePlayerApi,
    onSuccess: () => {
      socket?.emit('players:update', { guildId: player.guildId });
    },
  });

  const deletePlayer = (playerId: string) => {
    deletePlayerMutation.mutate(playerId);
  };

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
      {currentUserId === ownerId && (
        <>
          {player.userId !== ownerId && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-white hover:text-red-500 cursor-pointer"
              onClick={() => deletePlayer(player.inviteToken)}
              aria-label={`Delete ${player.user?.name ?? player.inviteToken}`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div
            className={`absolute top-2 left-2 cursor-grab rounded p-1 ${COLOR_CONFIG[colorLabel].dragHandleClass}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-white" />
          </div>
        </>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg">
          {!player.userId ? (
            <div className="flex items-center justify-center gap-2">
              <span
                className="truncate sm:max-w-[100px] w-[180px] text-sm"
                title={player.inviteToken}
              >
                {player.inviteToken}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${window.location.origin}/players/new/${player.inviteToken}`,
                  )
                }
                aria-label="Copy invite link"
                className="h-8 p-2 cursor-pointer"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span className="text-sm">
              {player.user?.name || player.user?.email || player.userId}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        <div className="flex items-center justify-center">
          <div className="font-bold font-mono text-4xl tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </div>

        {(player.userId === currentUserId || currentUserId === ownerId) && (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('decrease', 1)}
                  disabled={timeLeft <= 0}
                  aria-label="Decrease 1 second"
                  className="h-7 px-2 cursor-pointer"
                >
                  - 1s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('decrease', 5)}
                  disabled={timeLeft < 5000}
                  aria-label="Decrease 5 seconds"
                  className="h-7 px-2 cursor-pointer"
                >
                  - 5s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('decrease', 10)}
                  disabled={timeLeft < 10000}
                  aria-label="Decrease 10 seconds"
                  className="h-7 px-2 cursor-pointer"
                >
                  - 10s
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('increase', 1)}
                  aria-label="Increase 1 second"
                  className="h-7 px-2 cursor-pointer"
                >
                  + 1s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('increase', 5)}
                  aria-label="Increase 5 seconds"
                  className="h-7 px-2 cursor-pointer"
                >
                  + 5s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendControl('increase', 10)}
                  aria-label="Increase 10 seconds"
                  className="h-7 px-2 cursor-pointer"
                >
                  + 10s
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {(player.userId === currentUserId || currentUserId === ownerId) && (
        <CardFooter className="flex justify-center gap-2 pt-0">
          {timerState && !timerState.isRunning ? (
            <Button
              onClick={() => sendControl('start')}
              size="sm"
              className="flex items-center gap-1 cursor-pointer"
            >
              <Play className="h-3 w-3" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => sendControl('pause')}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1 cursor-pointer"
            >
              <Pause className="h-3 w-3" />
              Pause
            </Button>
          )}
          <Button
            onClick={() => sendControl('reset')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
