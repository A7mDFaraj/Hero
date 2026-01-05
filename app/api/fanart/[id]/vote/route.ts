import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'fanart.json');

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

    // Read current fan arts
    let allFanArts;
    try {
      const data = await fs.readFile(STORAGE_FILE, 'utf-8');
      allFanArts = JSON.parse(data);
    } catch {
      return NextResponse.json(
        { error: 'Fan art not found' },
        { status: 404 }
      );
    }

    const fanArt = allFanArts.find((art: any) => art.id === id);

    if (!fanArt) {
      return NextResponse.json(
        { error: 'Fan art not found' },
        { status: 404 }
      );
    }

    // Update vote counts
    // Note: In Phase 2, this should track individual votes per user/IP to prevent abuse
    // For now, client handles vote removal/switching locally, server just increments
    const updatedFanArt = {
      ...fanArt,
      likes: voteType === 'like' ? (fanArt.likes || 0) + 1 : (fanArt.likes || 0),
      dislikes: voteType === 'dislike' ? (fanArt.dislikes || 0) + 1 : (fanArt.dislikes || 0),
    };

    // Update in storage
    const index = allFanArts.findIndex((art: any) => art.id === id);
    if (index !== -1) {
      allFanArts[index] = updatedFanArt;
      await fs.writeFile(STORAGE_FILE, JSON.stringify(allFanArts, null, 2));
    }

    return NextResponse.json({ success: true, data: updatedFanArt });
  } catch (error) {
    console.error('Error voting on fan art:', error);
    return NextResponse.json(
      { error: 'Failed to vote on fan art' },
      { status: 500 }
    );
  }
}
