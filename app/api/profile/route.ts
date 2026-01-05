import { NextRequest, NextResponse } from 'next/server';
import { profileStorageServer } from '@/lib/profile-storage-server';
import { Profile } from '@/types';

// GET - Fetch profile
export async function GET() {
  try {
    const profile = await profileStorageServer.get();
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bio, avatar, twitchStatus, socialLinks } = body;

    // Validation
    if (name && typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name must be a string' },
        { status: 400 }
      );
    }

    if (bio && typeof bio !== 'string') {
      return NextResponse.json(
        { error: 'Bio must be a string' },
        { status: 400 }
      );
    }

    if (avatar && typeof avatar !== 'string') {
      return NextResponse.json(
        { error: 'Avatar must be a valid URL' },
        { status: 400 }
      );
    }

    if (twitchStatus && !['live', 'offline'].includes(twitchStatus)) {
      return NextResponse.json(
        { error: 'Twitch status must be "live" or "offline"' },
        { status: 400 }
      );
    }

    // Validate social links if provided
    if (socialLinks && typeof socialLinks === 'object') {
      for (const [platform, url] of Object.entries(socialLinks)) {
        if (url && typeof url === 'string') {
          try {
            new URL(url);
          } catch {
            return NextResponse.json(
              { error: `Invalid URL for ${platform}` },
              { status: 400 }
            );
          }
        }
      }
    }

    const updatedProfile = await profileStorageServer.update({
      ...(name && { name }),
      ...(bio && { bio }),
      ...(avatar && { avatar }),
      ...(twitchStatus && { twitchStatus }),
      ...(socialLinks && { socialLinks }),
    });

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update profile: ${errorMessage}` },
      { status: 500 }
    );
  }
}
