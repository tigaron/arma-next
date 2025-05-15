'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { createDefaultGuild, joinGuildByInviteCode } from '~/server/api-client';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function NewPlayerForm() {
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState('');

  const createGuild = useMutation({
    mutationFn: createDefaultGuild,
    onSuccess: () => {
      toast.success('Successfully created a new guild!');
      setTimeout(() => {
        redirect('/');
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(
        error?.message || 'Failed to create the guild. Please try again.',
      );
    },
  });

  const joinGuild = useMutation({
    mutationFn: (code: string) => joinGuildByInviteCode(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['teams', { guildId: data.guildId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['players', { guildId: data.guildId }],
      });
      toast.success('Successfully joined the guild!');
      setTimeout(() => {
        redirect('/');
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(
        error?.message || 'Failed to join the guild. Please try again.',
      );
    },
  });

  return (
    <div className="flex flex-col px-4 sm:px-16 gap-2">
      <Input
        className="bg-muted text-md md:text-sm"
        type="text"
        placeholder="Enter your invite code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        autoFocus
      />
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => {
          if (inviteCode.trim()) {
            joinGuild.mutate(inviteCode.trim());
          }
        }}
      >
        Join Guild
      </Button>
      <p className="mt-4 text-center text-gray-600 text-sm dark:text-zinc-400">
        Want to create a new guild?
      </p>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => {
          createGuild.mutate();
        }}
      >
        Create New Guild
      </Button>
    </div>
  );
}
