import { redirect } from 'next/navigation';
import LandingPage from '~/components/landing-page';

import { auth } from '~/server/auth';
import { getPlayerByUserId } from '~/server/db/query';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  const player = await getPlayerByUserId(session.user.id);

  if (!player) {
    redirect('/players/new');
  }

  return <LandingPage player={player} />;
}
