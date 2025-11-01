import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "YOUR_HEADER_HERE", // We'll fill this in Step 3
      payload: "YOUR_PAYLOAD_HERE",
      signature: "YOUR_SIGNATURE_HERE"
    },
    frame: {
      version: "1",
      name: "2048 Base Game",
      subtitle: "Classic 2048 puzzle game on Base",
      description: "Play the addictive 2048 puzzle game. Swipe to combine tiles and reach 2048!",
      homeUrl: "https://YOUR_DEPLOYED_URL.vercel.app",
      iconUrl: "https://YOUR_DEPLOYED_URL.vercel.app/icon.png",
      splashImageUrl: "https://YOUR_DEPLOYED_URL.vercel.app/splash.png",
      splashBackgroundColor: "#8F7A66",
      webhookUrl: "https://YOUR_DEPLOYED_URL.vercel.app/api/webhook",
      primaryCategory: "games",
      tags: ["puzzle", "2048", "game", "base"],
      heroImageUrl: "https://YOUR_DEPLOYED_URL.vercel.app/screenshot1.png",
      screenshotUrls: [
        "https://YOUR_DEPLOYED_URL.vercel.app/screenshot1.png",
        "https://YOUR_DEPLOYED_URL.vercel.app/screenshot2.png"
      ]
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
