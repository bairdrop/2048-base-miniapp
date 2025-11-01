'use client';

import { useEffect } from 'react';
import Game2048 from '@/components/Game2048';

export default function Home() {
  useEffect(() => {
    // Only try to load Frame SDK in the browser after mount
    if (typeof window !== 'undefined') {
      import('@farcaster/frame-sdk')
        .then((module) => {
          return module.sdk.actions.ready();
        })
        .then(() => {
          console.log('Frame SDK initialized');
        })
        .catch((error) => {
          console.log('Running without Frame SDK');
        });
    }
  }, []);

  return (
    <main className="min-h-screen">
      <Game2048 />
    </main>
  );
}
