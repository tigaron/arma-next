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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  type TeamWithColors,
  addPlayerApi,
  addTeamApi,
  deletePlayerApi,
  deleteTeamApi,
  fetchPlayers,
  fetchTeams,
  movePlayerApi,
  updateColorOrderApi,
} from '~/server/api-client';
import type { GuildBattleTimeSlot, PlayerColor } from '~/types';
import { AddTeamForm } from './add-team-form';
import { GuildBattleTimer } from './guild-battle-timer';
import { TeamSection } from './team-section';

interface CountdownTimerProps {
  currentUserId: string;
  ownerId: string;
  timeSlot: GuildBattleTimeSlot;
  battleDates: DateRange;
}

export function CountdownTimer({
  currentUserId,
  ownerId,
  timeSlot,
  battleDates,
}: CountdownTimerProps) {
  const queryClient = useQueryClient();

  // Queries
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });

  // Mutations
  const addTeamMutation = useMutation({
    mutationFn: addTeamApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const updateColorOrderMutation = useMutation({
    mutationFn: ({
      teamId,
      colorOrder,
    }: { teamId: string; colorOrder: PlayerColor[] }) =>
      updateColorOrderApi(teamId, colorOrder),
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData(['teams'], (oldTeams: TeamWithColors[] = []) => {
        return oldTeams.map((team) =>
          team.id === updatedTeam.id ? updatedTeam : team,
        );
      });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: deleteTeamApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: addPlayerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const movePlayerMutation = useMutation({
    mutationFn: ({
      playerId,
      teamId,
      colorId,
      position,
    }: {
      playerId: string;
      teamId: string;
      colorId: string;
      position: number;
    }) => movePlayerApi(playerId, teamId, colorId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: deletePlayerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
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

  const addPlayer = (teamId: string, colorId: string, position: number) => {
    addPlayerMutation.mutate({ teamId, colorId, position });
  };

  const addTeam = (name: string) => {
    addTeamMutation.mutate(name);
    setShowAddTeamForm(false);
  };

  const deletePlayer = (playerId: string) => {
    deletePlayerMutation.mutate(playerId);
  };

  const deleteTeam = (team: TeamWithColors) => {
    // Don't allow deleting the default team
    if (team.isDefault) return;

    deleteTeamMutation.mutate(team.id);
  };

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
            ) as PlayerColor[];

            // Update color order via dedicated API
            updateColorOrderMutation.mutate({
              teamId,
              colorOrder: newColorOrder,
            });
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
      movePlayerMutation.mutate({
        playerId: activePlayerId,
        colorId: targetColorId,
        teamId: targetTeamId,
        position: targetPosition,
      });
    }

    // Reset drag state
    setActiveId(null);
    setActiveDragData(null);
  };

  return (
    <div className="space-y-6">
      {/* Guild Battle Timer */}
      <GuildBattleTimer
        timeSlot={timeSlot}
        battleDates={battleDates}
        isAdmin={currentUserId === ownerId}
      />

      {/* Admin Add Team Button */}
      {currentUserId === ownerId && (
        <div className="mb-4">
          <AddTeamForm
            onAdd={addTeam}
            onCancel={() => setShowAddTeamForm(!showAddTeamForm)}
            isOpen={showAddTeamForm}
          />
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
              currentUserId={currentUserId}
              ownerId={ownerId}
              onDeleteTeam={deleteTeam}
              onDeletePlayer={deletePlayer}
              onAddPlayer={addPlayer}
            />
          ))}
        </div>

        {/* Drag overlay for preview */}
        <DragOverlay>
          {activeId && activeDragData?.type === 'player' && (
            <div className="rounded border border-gray-300 bg-gray-100 p-2 opacity-50">
              Dragging:{' '}
              {activeDragData.user?.name || activeDragData.inviteToken}
            </div>
          )}
          {activeId && activeDragData?.type === 'color' && (
            <div className="rounded border border-gray-300 bg-gray-100 p-2 opacity-50">
              Dragging: {activeDragData.label}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
