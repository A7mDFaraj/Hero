import { NextRequest, NextResponse } from 'next/server';
import { fanArtStorageServer } from '@/lib/fanart-storage-server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary for deletion
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PATCH - Update fan art (e.g., toggle isActive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get all fan arts
    const allFanArts = await fanArtStorageServer.getAll();
    const fanArtIndex = allFanArts.findIndex((art) => art.id === id);

    if (fanArtIndex === -1) {
      return NextResponse.json(
        { error: 'Fan art not found' },
        { status: 404 }
      );
    }

    // Update the fan art using storage server
    const updatedFanArt = await fanArtStorageServer.update(id, body);

    return NextResponse.json({ success: true, data: updatedFanArt });
  } catch (error) {
    console.error('Error updating fan art:', error);
    return NextResponse.json(
      { error: 'Failed to update fan art' },
      { status: 500 }
    );
  }
}

// DELETE - Delete fan art
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the fan art to extract Cloudinary public_id if it exists
    const allFanArts = await fanArtStorageServer.getAll();
    const fanArt = allFanArts.find((art) => art.id === id);

    if (!fanArt) {
      return NextResponse.json(
        { error: 'Fan art not found' },
        { status: 404 }
      );
    }

    // If image is from Cloudinary, delete it from Cloudinary too
    // Only delete images from this project's folder (streamer-website/fanart-gallery)
    if (fanArt.image.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
        const urlParts = fanArt.image.split('/upload/');
        if (urlParts.length > 1) {
          const publicIdWithFormat = urlParts[1].split('.')[0];
          const publicId = publicIdWithFormat.replace(/^v\d+\//, ''); // Remove version prefix if exists
          
          // Delete from project-specific folder
          await cloudinary.uploader.destroy(`streamer-website/fanart-gallery/${publicId}`);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with local deletion even if Cloudinary deletion fails
      }
    }

    // Delete from server storage
    await fanArtStorageServer.delete(id);

    return NextResponse.json({ success: true, message: 'Fan art deleted successfully' });
  } catch (error) {
    console.error('Error deleting fan art:', error);
    return NextResponse.json(
      { error: 'Failed to delete fan art' },
      { status: 500 }
    );
  }
}
