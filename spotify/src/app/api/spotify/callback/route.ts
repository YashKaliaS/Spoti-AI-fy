// src/app/api/spotify/callback/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    // Exchange the code for an access token from Spotify's API
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      return NextResponse.json({ access_token: data.access_token });
    } else {
      throw new Error('Error fetching Spotify token');
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch access token' }, { status: 500 });
  }
}
