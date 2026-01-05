import { NextRequest, NextResponse } from 'next/server';
import { fanArtStorageServer } from '@/lib/fanart-storage-server';
import { FanArt } from '@/types';

// GET - Fetch all fan arts (optionally filter by isActive)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    let fanArts = await fanArtStorageServer.getAll();
    
    // Filter by active status if requested
    if (activeOnly) {
      fanArts = fanArts.filter((art) => art.isActive !== false);
    }
    
    return NextResponse.json({ success: true, data: fanArts });
  } catch (error) {
    console.error('Error fetching fan arts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fan arts' },
      { status: 500 }
    );
  }
}

// POST - Create new fan art
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, creatorName, creatorLink, adminRating, likes, dislikes } = body;

    // Validation
    if (!image || !creatorName?.trim()) {
      return NextResponse.json(
        { error: 'Image and creator name are required' },
        { status: 400 }
      );
    }

    // Validate image is a valid URL (Cloudinary URL)
    if (typeof image !== 'string' || (!image.startsWith('http') && !image.startsWith('data:'))) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    // Validate URL format if provided
    if (creatorLink && creatorLink.trim()) {
      try {
        new URL(creatorLink);
      } catch {
        return NextResponse.json(
          { error: 'Invalid creator link URL format' },
          { status: 400 }
        );
      }
    }

    // Validate admin rating if provided
    if (adminRating !== undefined) {
      const ratingNum = parseInt(adminRating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return NextResponse.json(
          { error: 'Admin rating must be a number between 1 and 5' },
          { status: 400 }
        );
      }
    }

    const newFanArt = await fanArtStorageServer.add({
      image: image.trim(),
      creatorName: creatorName.trim(),
      creatorLink: creatorLink?.trim() || undefined,
      adminRating: adminRating ? parseInt(adminRating) : undefined,
      likes: likes !== undefined ? parseInt(likes) : 0,
      dislikes: dislikes !== undefined ? parseInt(dislikes) : 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ success: true, data: newFanArt }, { status: 201 });
  } catch (error) {
    console.error('Error creating fan art:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create fan art: ${errorMessage}` },
      { status: 500 }
    );
  }
}
