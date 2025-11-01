'use client';

import { useEffect } from 'react';
import Game2048 from '@/components/Game2048';

export default function Home() {
  useEffect(() => {
    const initSDK = async () => {
      try {
        // Dynamically import to avoid build errors
        const { sdk } = await import('@farcaster/frame-sdk');
        await sdk.actions.ready();
        console.log('Frame SDK initialized');
      } catch (error) {
        console.error('Frame SDK not available:', error);
      }
    };
    
    initSDK();
  }, []);

  return (
    <main className="min-h-screen">
      <Game2048 />
    </main>
  );
}
