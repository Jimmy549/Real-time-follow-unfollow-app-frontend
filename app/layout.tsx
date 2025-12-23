'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAppStore } from '../lib/store';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setToken, initializeSocket } = useAppStore();

  useEffect(() => {
    // Initialize user from localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setToken(token);
      setUser(JSON.parse(user));
      initializeSocket();
    }
  }, [setUser, setToken, initializeSocket]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen cyber-grid">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(26, 26, 26, 0.9)',
              color: '#fff',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </body>
    </html>
  );
}