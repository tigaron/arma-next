'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  createDefaultGuild,
  fetchMe,
  joinGuildByInviteCode,
} from '~/server/api-client';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function NewPlayerForm() {
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState('');

  // Fetch the "me" data
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
  });

  // Mutation to create a default guild
  const createGuild = useMutation({
    mutationFn: createDefaultGuild,
    onSuccess: () => {
      toast.success('Successfully created a new guild!');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      // Show error toast
      toast.error(
        error?.message || 'Failed to create the guild. Please try again.',
      );
    },
  });

  // Mutation to join a guild using an invite code
  const joinGuild = useMutation({
    mutationFn: (code: string) => joinGuildByInviteCode(code),
    onSuccess: (data) => {
      // Show success toast
      toast.success('Successfully joined the guild!');
      // Redirect after showing the toast
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({
        queryKey: ['players', { guildId: data.guildId }],
      });
    },
    onError: (error: any) => {
      // Show error toast
      toast.error(
        error?.message || 'Failed to join the guild. Please try again.',
      );
    },
  });

  if (me) {
    redirect('/');
  }

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
