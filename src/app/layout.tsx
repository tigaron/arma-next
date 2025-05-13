import '~/styles/globals.css';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import QueryProvider from '~/providers/query-provider';
import { SocketProvider } from '~/providers/socket-provider';

export const metadata: Metadata = {
  title: 'Armageddon Battle Timer',
  description: 'A customizable battle timer application',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <SocketProvider>
          <QueryProvider>{children}</QueryProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
