import '~/styles/globals.css';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from '~/components/ui/sonner';
import QueryProvider from '~/providers/query-provider';
import { SocketProvider } from '~/providers/socket-provider';
import { ThemeProvider } from '~/providers/theme-provider';

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
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>
            <QueryProvider>{children}</QueryProvider>
          </SocketProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
