import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'LinkedIn URL is required' },
        { status: 400 }
      );
    }

    // Fetch LinkedIn oEmbed data
    const response = await fetch(
      `https://www.linkedin.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn post data');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('LinkedIn oEmbed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LinkedIn post' },
      { status: 500 }
    );
  }
}
