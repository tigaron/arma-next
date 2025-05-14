import { redirect } from 'next/navigation';
import PlayerClaim from '~/components/player-claim-page';
import { auth } from '~/server/auth';

export default async function PlayerClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  return <PlayerClaim token={token} />;
}
