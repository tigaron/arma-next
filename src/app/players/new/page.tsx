import { redirect } from 'next/navigation';
import { NewPlayerForm } from '~/components/new-player-form';
import { auth } from '~/server/auth';

export default async function NewPlayerPage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-2 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl dark:text-zinc-50">Welcome!</h3>
        </div>
        <NewPlayerForm />
      </div>
    </div>
  );
}
