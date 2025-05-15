'use client';

import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import type { PlayerWithUser } from '~/server/api-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function NavHeader({ player }: { player: PlayerWithUser }) {
  const { setTheme, theme } = useTheme();

  return (
    <div className="w-full max-w-6xl flex justify-between items-center mb-4 text-center">
      <h1 className="text-center font-bold text-3xl">Armageddon Timer</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="bg-background cursor-pointer">
            <Image
              src={`https://avatar.vercel.sh/${player.userId}.svg?text=Hi`}
              alt={player.userId ?? 'User Avatar'}
              width={30}
              height={30}
              className="rounded-full"
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          className="w-[--radix-popper-anchor-width]"
        >
          <DropdownMenuItem>
            {player.user?.name || player.user?.email || player.userId}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button
              type="button"
              className="w-full cursor-pointer"
              onClick={() => {
                signOut({
                  redirectTo: '/',
                });
              }}
            >
              {'Sign out'}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
