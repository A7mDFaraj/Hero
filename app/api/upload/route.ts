import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string | null; // 'profile' or 'fanart'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);
    
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WEBP) and videos (MP4, WEBM, MOV, AVI) are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (100MB max for videos, 10MB for images)
    const MAX_SIZE = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File size too large. Maximum size is ${isVideo ? '100MB' : '10MB'}. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    // Using dedicated folders AND tags to keep images completely separate from other projects
    const isProfileImage = uploadType === 'profile';
    const folder = isProfileImage 
      ? 'streamer-website/profile' 
      : isVideo
        ? 'streamer-website/featured-works'
        : 'streamer-website/fanart-gallery';
    const tags = isProfileImage
      ? ['streamer-website-profile', 'profile-image']
      : isVideo
        ? ['streamer-website-featured', 'featured-works']
        : ['streamer-website-fanart', 'fanart-gallery'];
    
    const resourceType = isVideo ? 'video' : 'image';
    const transformation = isProfileImage
      ? [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }]
      : isVideo
        ? [{ quality: 'auto', format: 'mp4' }]
        : [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }];

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          tags,
          resource_type: resourceType,
          transformation,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    const result = uploadResult as {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
    };

    return NextResponse.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}
