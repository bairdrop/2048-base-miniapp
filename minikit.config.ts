// Base Mini App Configuration
// No external dependencies needed

interface AccountAssociation {
  header?: string;
  payload?: string;
  signature?: string;
}

interface MiniAppConfig {
  name: string;
  subtitle: string;
  description: string;
  version: string;
  url: string;
  iconUrl: string;
  splashImageUrl: string;
  homeUrl: string;
  screenshotUrls: string[];
  primaryCategory: string;
  tags: string[];
  accountAssociation: AccountAssociation;
}

interface AppConfig {
  miniapp: MiniAppConfig;
}

export const config: { app: AppConfig } = {
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
        // Leave empty for now. After deploying and signing at base.dev/preview,
        // add your signature here like this:
        // header: 'eyJmaWQ...',
        // payload: 'eyJkb21...',
        // signature: 'MHg3Zm...'
      }
    }
  }
};
