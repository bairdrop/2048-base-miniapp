import { NextResponse } from 'next/server';
import { config } from '@/minikit.config';

export async function GET() {
  return NextResponse.json(config.app.miniapp, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
