import Game2048 from '@/components/Game2048';

export default function Home() {
  return (
    <main>
      <Game2048 />
    </main>
  );
}

import { sdk } from '@farcaster/frame-sdk';
import { useEffect } from 'react';

export default function Game() {
  useEffect(() => {
    // Initialize the SDK when component mounts
    const initSDK = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
      }
    };
    
    initSDK();
  }, []);

  // Your existing game code...
}
