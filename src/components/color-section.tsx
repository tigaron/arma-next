'use client';

import { useSortable } from '@dnd-kit/sortable';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import { COLOR_CONFIG } from '~/lib/constants';
import type { PlayerWithUser } from '~/server/api-client';
import type { Color } from '~/server/db/schema';
import { AddPlayerForm } from './add-player-form';
import { PlayerTimerCard } from './player-timer-card';

interface ColorSectionProps {
  currentUserId: string;
  ownerId: string;
  teamId: string;
  color: Color;
  players: PlayerWithUser[];
  onAddPlayer: (teamId: string, colorId: string, position: number) => void;
}

export function ColorSection({
  currentUserId,
  ownerId,
  teamId,
  color,
  players,
  onAddPlayer,
}: ColorSectionProps) {
  // Ensure the color section is properly handling the drag events
  // Update the useSortable hook to ensure it's correctly set up
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `[${teamId}][${color.id}]`,
    data: {
      type: 'color',
      ...color,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  // Sort players by order if available
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.position !== undefined && b.position !== undefined) {
      return a.position - b.position;
    }
    return 0;
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${COLOR_CONFIG[color.label].bgClass} rounded-md ${COLOR_CONFIG[color.label].borderClass} overflow-hidden border`}
    >
      {/* Make sure the drag handle is properly set up */}
      <div
        className={`${COLOR_CONFIG[color.label].headerBgClass} flex items-center justify-between p-2`}
      >
        <h3 className={`font-medium ${COLOR_CONFIG[color.label].textClass}`}>
          {COLOR_CONFIG[color.label].label}
          <span className="ml-2 text-sm">({players.length})</span>
        </h3>
        {currentUserId === ownerId && (
          <div
            className={`cursor-grab rounded p-1 ${COLOR_CONFIG[color.label].dragHandleClass}`}
            {...attributes}
            {...listeners}
          >
            <GripHorizontal className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      <div className="space-y-4 p-3">
        <SortableContext
          items={sortedPlayers.map((player) => player.position)}
          strategy={verticalListSortingStrategy}
        >
          {sortedPlayers.map((player) => (
            <PlayerTimerCard
              key={player.inviteToken}
              player={player}
              colorLabel={color.label}
              currentUserId={currentUserId}
              ownerId={ownerId}
            />
          ))}
        </SortableContext>

        {/* Add Player Button - Only visible to admin */}
        {currentUserId === ownerId && (
          <AddPlayerForm
            teamId={teamId}
            colorId={color.id}
            onAdd={onAddPlayer}
            position={players.length}
          />
        )}
      </div>
    </div>
  );
}
