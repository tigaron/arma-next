import { redirect } from 'next/navigation';
import LandingPage from '~/components/landing-page';

import { auth } from '~/server/auth';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  return <LandingPage />;
}
