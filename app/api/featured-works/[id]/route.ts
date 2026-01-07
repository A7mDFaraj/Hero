import { NextRequest, NextResponse } from 'next/server';
import { featuredWorksStorageServer } from '@/lib/featured-works-storage-server';

// PATCH - Update featured work
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate URL if provided
    if (body.url) {
      try {
        new URL(body.url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    // Validate kind if provided
    if (body.kind && !['image', 'video', 'gif'].includes(body.kind)) {
      return NextResponse.json(
        { error: 'Kind must be one of: image, video, gif' },
        { status: 400 }
      );
    }

    // Validate posterUrl if provided
    if (body.posterUrl) {
      try {
        new URL(body.posterUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid poster URL format' },
          { status: 400 }
        );
      }
    }

    const updated = await featuredWorksStorageServer.update(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating featured work:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update featured work: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete featured work
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await featuredWorksStorageServer.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting featured work:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete featured work: ${errorMessage}` },
      { status: 500 }
    );
  }
}
