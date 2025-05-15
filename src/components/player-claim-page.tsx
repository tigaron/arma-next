'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { joinGuildByInviteCode } from '~/server/api-client';

export default function PlayerClaim({ token }: { token: string }) {
  const queryClient = useQueryClient();

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
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-2 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl dark:text-zinc-50">Welcome!</h3>
        </div>
        <div className="flex flex-col px-4 sm:px-16 gap-2">
          <Input
            className="bg-muted text-md md:text-sm"
            type="text"
            placeholder="Enter your invite code"
            value={token}
            disabled
          />
          <Button
            className="cursor-pointer"
            onClick={() => {
              if (token.trim()) {
                joinGuild.mutate(token.trim());
              }
            }}
          >
            Join Guild
          </Button>
        </div>
      </div>
    </div>
  );
}
