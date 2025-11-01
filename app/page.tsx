'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const Game2048 = dynamic(() => import('@/components/Game2048'), {
  ssr: false,
});

export default function Home() {
  useEffect(() => {
    const initSDK = async () => {
      try {
        const frameSDK = await import('@farcaster/frame-sdk');
        await frameSDK.sdk.actions.ready();
        console.log('Frame SDK initialized');
      } catch (error) {
        console.log('Frame SDK not available, running in standalone mode');
      }
    };
    
    if (typeof window !== 'undefined') {
      initSDK();
    }
  }, []);

  return (
    <main className="min-h-screen">
      <Game2048 />
    </main>
  );
}
