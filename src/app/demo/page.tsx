import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import GuildPageComponent from './component';

export default async function GuildPage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  return <GuildPageComponent />;
}
