'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CountdownTimer } from '~/components/countdown-timer';
import { Button } from '~/components/ui/button';
import { createDefaultGuild, fetchMe } from '~/server/api-client';

export default function GuildPageComponent() {
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });

  const createGuild = useMutation({
    mutationFn: createDefaultGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  if (!me) {
    return (
      <div>
        <div>Create new guild</div>
        <Button
          onClick={() => {
            createGuild.mutate();
          }}
        >
          Create
        </Button>
      </div>
    );
  }

  const isOwner = me.userId === me.guild?.ownerId;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-8 text-center font-bold text-3xl">
          Armageddon Battle Timer
        </h1>
        <CountdownTimer
          isOwner={isOwner}
          timeSlot={me.guild.battleSlot.label}
          battleDates={me.guild.battleDates}
        />
      </div>
    </main>
  );
}
