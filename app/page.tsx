'use client';

import { useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import Game2048 from '@/components/Game2048';

export default function Home() {
  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready();
        console.log('Frame SDK initialized');
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
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
