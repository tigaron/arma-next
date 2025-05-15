'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { CountdownTimer } from '~/components/countdown-timer';
import { useSocket } from '~/providers/socket-provider';
import {
  type PlayerWithUser,
  type TeamWithColors,
  addPlayerApi,
  addTeamApi,
  deleteTeamApi,
  fetchGuild,
  movePlayerApi,
  updateColorOrderApi,
  updateGuildBattleDatesApi,
  updateGuildBattleTimeSlotApi,
} from '~/server/api-client';
import type { BattleSlot, Color } from '~/server/db/schema';
import { AddTeamForm } from './add-team-form';
import { GuildTimer } from './guild-battle-timer';
import { NavHeader } from './nav-header';
import { Skeleton } from './ui/skeleton';

export default function LandingPage({ player }: { player: PlayerWithUser }) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const [showAddTeamForm, setShowAddTeamForm] = useState(false);

  const { data: guild, isLoading: isLoadingGuild } = useQuery({
    queryKey: ['guild', { guildId: player.guildId }],
    queryFn: () => fetchGuild(player.guildId!),
  });

  const ioGuildUpdate = () => {
    queryClient.invalidateQueries({
      queryKey: ['guild', { guildId: player.guildId }],
    });
  };

  const ioTeamUpdate = () => {
    queryClient.invalidateQueries({
      queryKey: ['teams', { guildId: player.guildId }],
    });
  };

  const ioPlayerUpdate = () => {
    queryClient.invalidateQueries({
      queryKey: ['players', { guildId: player.guildId }],
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit('guild:join', { guildId: player.guildId });

    socket.on(`guild:${player.guildId}:update`, ioGuildUpdate);
    socket.on(`guild:${player.guildId}:teams:update`, ioTeamUpdate);
    socket.on(`guild:${player.guildId}:players:update`, ioPlayerUpdate);

    return () => {
      socket.off(`guild:${player.guildId}:update`);
      socket.off(`guild:${player.guildId}:teams:update`);
      socket.off(`guild:${player.guildId}:players:update`);
    };
  }, [socket, guild, queryClient]);

  const updateColorOrderMutation = useMutation({
    mutationFn: ({
      teamId,
      colorOrder,
    }: { teamId: string; colorOrder: Color['label'][] }) =>
      updateColorOrderApi(teamId, colorOrder),
    onSuccess: () => {
      socket?.emit('teams:update', { guildId: player.guildId });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: deleteTeamApi,
    onSuccess: () => {
      socket?.emit('teams:update', { guildId: player.guildId });
      socket?.emit('players:update', { guildId: player.guildId });
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
      socket?.emit('teams:update', { guildId: player.guildId });
      socket?.emit('players:update', { guildId: player.guildId });
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: addPlayerApi,
    onSuccess: () => {
      socket?.emit('teams:update', { guildId: player.guildId });
      socket?.emit('players:update', { guildId: player.guildId });
    },
  });

  const addTeamMutation = useMutation({
    mutationFn: addTeamApi,
    onSuccess: () => {
      socket?.emit('teams:update', { guildId: player.guildId });
    },
  });

  const updateTimeSlotMutation = useMutation({
    mutationFn: updateGuildBattleTimeSlotApi,
    onSuccess: () => {
      socket?.emit('guild:update', { guildId: player.guildId });
    },
  });

  const updateBattleDatesMutation = useMutation({
    mutationFn: updateGuildBattleDatesApi,
    onSuccess: () => {
      socket?.emit('guild:update', { guildId: player.guildId });
    },
  });

  const onUpdateColor = (teamId: string, newColorOrder: Color['label'][]) => {
    updateColorOrderMutation.mutate({
      teamId,
      colorOrder: newColorOrder,
    });
  };

  const onMovePlayer = (
    activePlayerId: string,
    targetColorId: string,
    targetTeamId: string,
    targetPosition: number,
  ) => {
    movePlayerMutation.mutate({
      playerId: activePlayerId,
      colorId: targetColorId,
      teamId: targetTeamId,
      position: targetPosition,
    });
  };

  const onAddPlayer = (teamId: string, colorId: string, position: number) => {
    addPlayerMutation.mutate({ teamId, colorId, position });
  };

  const onDeleteTeam = (team: TeamWithColors) => {
    if (team.isDefault) return;
    deleteTeamMutation.mutate(team.id);
  };

  const onAddTeam = (name: string) => {
    addTeamMutation.mutate(name);
    setShowAddTeamForm(false);
  };

  const onUpdateTimeSlot = (newTimeSlot: BattleSlot['label']) => {
    updateTimeSlotMutation.mutate(newTimeSlot);
  };

  const onUpdateBattleDates = (newRange: DateRange) => {
    updateBattleDatesMutation.mutate(newRange);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start space-y-3 py-4">
      <NavHeader player={player} />
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {isLoadingGuild ? (
          <Skeleton className="h-[170px] w-full rounded-xl" />
        ) : (
          <GuildTimer
            userId={player.userId!}
            guild={guild!}
            onUpdateTimeSlot={onUpdateTimeSlot}
            onUpdateBattleDates={onUpdateBattleDates}
          />
        )}
        {isLoadingGuild ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <Skeleton className="h-7 w-[180px]" />
              <Skeleton className="h-8 w-[100px]" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </>
        ) : (
          <div className="space-y-6">
            {player.userId === guild!.ownerId && (
              <AddTeamForm
                onAddTeam={onAddTeam}
                onCancel={() => setShowAddTeamForm(!showAddTeamForm)}
                isOpen={showAddTeamForm}
              />
            )}
            <CountdownTimer
              player={player}
              guild={guild!}
              onAddPlayer={onAddPlayer}
              onDeleteTeam={onDeleteTeam}
              onMovePlayer={onMovePlayer}
              onUpdateColor={onUpdateColor}
            />
          </div>
        )}
      </div>
    </main>
  );
}
