'use client';

import { useQuery } from '@tanstack/react-query';
import { CountdownTimer } from '~/components/countdown-timer';
import { type PlayerWithUser, fetchGuild } from '~/server/api-client';
import { GuildTimer } from './guild-battle-timer';
import { NavHeader } from './nav-header';
import { Skeleton } from './ui/skeleton';

export default function LandingPage({ player }: { player: PlayerWithUser }) {
  const { data: guild, isLoading: isLoadingGuild } = useQuery({
    queryKey: ['guild', { guildId: player.guildId }],
    queryFn: () => fetchGuild(player.guildId!),
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-start space-y-3 py-4">
      <NavHeader player={player} />
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {isLoadingGuild ? (
          <Skeleton className="h-[170px] w-full rounded-xl" />
        ) : (
          <GuildTimer userId={player.userId!} guild={guild!} />
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
          <CountdownTimer player={player} guild={guild!} />
        )}
      </div>
    </main>
  );
}
