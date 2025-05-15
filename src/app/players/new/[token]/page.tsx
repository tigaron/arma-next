import { redirect } from 'next/navigation';
import PlayerClaim from '~/components/player-claim-page';
import { auth } from '~/server/auth';
import { getPlayerByUserId } from '~/server/db/query';

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

  const player = await getPlayerByUserId(session.user.id);

  if (player) {
    redirect('/');
  }

  return <PlayerClaim token={token} />;
}
