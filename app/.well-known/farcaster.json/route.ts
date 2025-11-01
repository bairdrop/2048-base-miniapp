import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjUyNjk5NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDQ4YURERTk1ZkY1OGNjQzRBRTkxYjM3YzY4NkVmQTA3OTFhMDUxMDcifQ", // We'll fill this in Step 3
      payload: "eyJkb21haW4iOiIyMDQ4LWJhc2UtbWluaWFwcC52ZXJjZWwuYXBwIn0",
      signature: "VzGlpSDK1Iki14JAH/xGUJ8QNGm14offv0SPHuN2FhtVSqvt/Wre3VxF5QsjYDat4v7fynIKp/S4nLhYqMHwwRs="
    },
    frame: {
      version: "1",
      name: "2048 Base",
      subtitle: "Classic 2048 puzzle game on Base",
      description: "Play the addictive 2048 puzzle game. Swipe to combine tiles and reach 2048!",
      homeUrl: "https://2048-base-miniapp.vercel.app/",
      iconUrl: "https://2048-base-miniapp.vercel.app/icon.png",
      splashImageUrl: "https://2048-base-miniapp.vercel.app/splash.png",
      splashBackgroundColor: "#FF8C32",
      webhookUrl: "https://2048-base-miniapp.vercel.app/api/webhook",
      primaryCategory: "games",
      tags: ["puzzle", "2048", "game", "base"],
      heroImageUrl: "https://2048-base-miniapp.vercel.app/screenshot1.png",
      screenshotUrls: [
        "https://2048-base-miniapp.vercel.app/screenshot1.png",
        "https://2048-base-miniapp.vercel.app/screenshot2.png"
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
