'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { CountdownTimer } from '~/components/countdown-timer';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  createDefaultGuild,
  fetchMe,
  joinGuildByInviteCode,
} from '~/server/api-client';

export default function LandingPage() {
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState('');

  // Fetch the "me" data
  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: 2,
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
    onSuccess: () => {
      // Show success toast
      toast.success('Successfully joined the guild!');
      // Redirect after showing the toast
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      // Show error toast
      toast.error(
        error?.message || 'Failed to join the guild. Please try again.',
      );
    },
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Handle case where "me" is not available (e.g., no guild)
  if (!me) {
    return (
      <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
        <div className="flex w-full max-w-md flex-col gap-2 overflow-hidden rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="font-semibold text-xl dark:text-zinc-50">
              Welcome!
            </h3>
          </div>
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
              className="cursor-pointer"
              onClick={() => {
                createGuild.mutate();
              }}
            >
              Create New Guild
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-8 text-center font-bold text-3xl">
          Armageddon Battle Timer
        </h1>
        <CountdownTimer
          currentUserId={me.userId!}
          ownerId={me.guild.ownerId}
          timeSlot={me.guild.battleSlot.label}
          battleDates={me.guild.battleDates}
        />
      </div>
    </main>
  );
}
