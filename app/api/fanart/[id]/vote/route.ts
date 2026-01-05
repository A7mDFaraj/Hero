import { NextRequest, NextResponse } from 'next/server';
import { fanArtStorageServer } from '@/lib/fanart-storage-server';

// POST - Vote on fan art (like/dislike)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { voteType } = body;

    if (!voteType || !['like', 'dislike'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "like" or "dislike"' },
        { status: 400 }
      );
    }

    // Get current fan art
    const allFanArts = await fanArtStorageServer.getAll();
    const fanArt = allFanArts.find((art) => art.id === id);

    if (!fanArt) {
      return NextResponse.json(
        { error: 'Fan art not found' },
        { status: 404 }
      );
    }

    // Update vote counts
    // Note: In Phase 2, this should track individual votes per user/IP to prevent abuse
    // For now, client handles vote removal/switching locally, server just increments
    const updatedFanArt = await fanArtStorageServer.update(id, {
      likes: voteType === 'like' ? (fanArt.likes || 0) + 1 : (fanArt.likes || 0),
      dislikes: voteType === 'dislike' ? (fanArt.dislikes || 0) + 1 : (fanArt.dislikes || 0),
    });

    return NextResponse.json({ success: true, data: updatedFanArt });
  } catch (error) {
    console.error('Error voting on fan art:', error);
    return NextResponse.json(
      { error: 'Failed to vote on fan art' },
      { status: 500 }
    );
  }
}
