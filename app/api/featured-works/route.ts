import { NextRequest, NextResponse } from 'next/server';
import { featuredWorksStorageServer } from '@/lib/featured-works-storage-server';
import { FeaturedWork } from '@/types';

// GET - Fetch all featured works (optionally filter by isActive)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    let works = await featuredWorksStorageServer.getAll();
    
    // Filter by active status if requested
    if (activeOnly) {
      works = works.filter((work) => work.isActive !== false);
    }
    
    return NextResponse.json({ success: true, data: works });
  } catch (error) {
    console.error('Error fetching featured works:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured works' },
      { status: 500 }
    );
  }
}

// POST - Create new featured work
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, kind, posterUrl, isActive } = body;

    // Validation
    if (!url || !kind) {
      return NextResponse.json(
        { error: 'URL and kind (image/video/gif) are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate kind
    if (!['image', 'video', 'gif'].includes(kind)) {
      return NextResponse.json(
        { error: 'Kind must be one of: image, video, gif' },
        { status: 400 }
      );
    }

    // Validate posterUrl if provided
    if (posterUrl) {
      try {
        new URL(posterUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid poster URL format' },
          { status: 400 }
        );
      }
    }

    const newWork = await featuredWorksStorageServer.add({
      url: url.trim(),
      title: title?.trim() || undefined,
      kind: kind as 'image' | 'video' | 'gif',
      posterUrl: posterUrl?.trim() || undefined,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({ success: true, data: newWork }, { status: 201 });
  } catch (error) {
    console.error('Error creating featured work:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create featured work: ${errorMessage}` },
      { status: 500 }
    );
  }
}
