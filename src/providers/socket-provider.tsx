'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { type Socket, io } from 'socket.io-client';
import { env } from '~/env';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(env.NEXT_PUBLIC_SOCKET_URL);
    const initSocket = async () => {
      const res = await fetch('/api/socket');
      const { token } = await res.json();
      socketInstance.emit('auth', { token });
    };

    initSocket();

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): Socket | null => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};
