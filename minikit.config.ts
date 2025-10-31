import type { Minikit } from '@coinbase/onchainkit/farcaster';

export const config: Minikit.Config = {
  app: {
    miniapp: {
      name: '2048 Merge Master',
      subtitle: 'Classic puzzle game on Base',
      description: 'Join the numbers to reach 2048! A classic sliding puzzle game where you combine tiles with the same numbers. Swipe to move tiles and merge them together. Can you reach 2048?',
      version: '1.0.0',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app',
      iconUrl: `${process.env.NEXT_PUBLIC_APP_URL}/icon.png`,
      splashImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/splash.png`,
      homeUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
      screenshotUrls: [
        `${process.env.NEXT_PUBLIC_APP_URL}/screenshot1.png`,
        `${process.env.NEXT_PUBLIC_APP_URL}/screenshot2.png`
      ],
      primaryCategory: 'games',
      tags: ['puzzle', 'casual', 'strategy', 'numbers'],
      
      accountAssociation: {
        // Fill this after Step 7 (signing manifest)
      }
    }
  }
};
