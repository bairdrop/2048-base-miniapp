// Base Mini App Configuration
interface AccountAssociation {
  header?: string;
  payload?: string;
  signature?: string;
}

interface MiniAppConfig {
  name: string;
  subtitle?: string;
  description?: string;
  version: string;
  url: string;
  iconUrl: string;
  splashImageUrl: string;
  splashBackgroundColor: string;
  homeUrl: string;
  screenshotUrls?: string[];
  primaryCategory?: string;
  tags?: string[];
  accountAssociation?: AccountAssociation;
}

interface AppConfig {
  miniapp: MiniAppConfig;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://2048-base-miniapp.vercel.app';

export const config: { app: AppConfig } = {
  app: {
    miniapp: {
      name: '2048 Merge Master',
      subtitle: 'Classic puzzle game on Base',
      description: 'Join the numbers to reach 2048! A classic sliding puzzle game where you combine tiles with the same numbers. Swipe to move tiles and merge them together. Can you reach 2048?',
      version: '1.0.0',
      url: APP_URL,
      iconUrl: `${APP_URL}/icon.png`,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: '#4F46E5',
      homeUrl: APP_URL,
      screenshotUrls: [
        `${APP_URL}/screenshot1.png`,
        `${APP_URL}/screenshot2.png`
      ],
      primaryCategory: 'games',
      tags: ['puzzle', 'casual', 'strategy', 'numbers'],
      accountAssociation: {
        header: "eyJmaWQiOjUyNjk5NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDQ4YURERTk1ZkY1OGNjQzRBRTkxYjM3YzY4NkVmQTA3OTFhMDUxMDcifQ",
        payload: "eyJkb21haW4iOiIyMDQ4LWJhc2UtbWluaWFwcC52ZXJjZWwuYXBwIn0",
        signature: "VzGlpSDK1Iki14JAH/xGUJ8QNGm14offv0SPHuN2FhtVSqvt/Wre3VxF5QsjYDat4v7fynIKp/S4nLhYqMHwwRs="
      }
    }
  }
};
