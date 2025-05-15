'use client';

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  type GuildWithBattleSlot,
  type PlayerWithUser,
  type TeamWithColors,
  fetchPlayers,
  fetchTeams,
} from '~/server/api-client';
import type { Color } from '~/server/db/schema';
import { TeamSection } from './team-section';

interface CountdownTimerProps {
  player: PlayerWithUser;
  guild: GuildWithBattleSlot;
  onDeleteTeam: (team: TeamWithColors) => void;
  onAddPlayer: (teamId: string, colorId: string, position: number) => void;
  onUpdateColor: (teamId: string, newColorOrder: Color['label'][]) => void;
  onMovePlayer: (
    activePlayerId: string,
    targetColorId: string,
    targetTeamId: string,
    targetPosition: number,
  ) => void;
}

export function CountdownTimer({
  player,
  guild,
  onDeleteTeam,
  onAddPlayer,
  onUpdateColor,
  onMovePlayer,
}: CountdownTimerProps) {
  const { data: teams = [] } = useQuery({
    queryKey: ['teams', { guildId: guild.id }],
    queryFn: fetchTeams,
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players', { guildId: guild.id }],
    queryFn: fetchPlayers,
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<any>(null);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveDragData(event.active.data.current);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // If there's no valid drop target, reset drag state
    if (!over) {
      setActiveId(null);
      setActiveDragData(null);
      return;
    }

    // Extract data from active and over objects
    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) {
      setActiveId(null);
      setActiveDragData(null);
      return;
    }

    // Handle color reordering within a team
    if (activeData.type === 'color') {
      const activeColorId = activeData.id;
      const overColorId =
        overData.type === 'color' ? overData.id : overData.colorId;
      const teamId = activeData.teamId;

      // Ensure both colors belong to the same team
      if (activeData.teamId === overData.teamId) {
        const team = teams.find((t) => t.id === teamId);

        if (team) {
          const colorOrder = team.colors.map((c) => c.id);
          const oldIndex = colorOrder.indexOf(activeColorId);
          const newIndex = colorOrder.indexOf(overColorId);

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            // Ensure the indices are valid for arrayMove
            const newColorOrder = arrayMove(
              colorOrder,
              oldIndex,
              newIndex,
            ) as Color['label'][];

            // Update color order via dedicated API
            onUpdateColor(teamId, newColorOrder);
          }
        }
      }
    }

    // Handle player being dropped on a color section
    if (activeData.type === 'player') {
      const activePlayerId = activeData.inviteToken;
      const targetColorId =
        overData.type === 'player' ? overData.colorId : overData.id;
      const targetTeamId = overData.teamId;
      const targetPosition = overData.position;

      // Move player to the target team and color
      onMovePlayer(activePlayerId, targetColorId, targetTeamId, targetPosition);
    }

    // Reset drag state
    setActiveId(null);
    setActiveDragData(null);
  };

  return (
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
            currentUserId={player.userId!}
            ownerId={guild.ownerId}
            onDeleteTeam={onDeleteTeam}
            onAddPlayer={onAddPlayer}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId && activeDragData?.type === 'player' && (
          <div className="rounded border border-gray-300 bg-gray-100 p-2 opacity-50">
            Dragging: {activeDragData.user?.name || activeDragData.inviteToken}
          </div>
        )}
        {activeId && activeDragData?.type === 'color' && (
          <div className="rounded border border-gray-300 bg-gray-100 p-2 opacity-50">
            Dragging: {activeDragData.label}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
