// app/api/candidate/profile/upload-profile-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// Helper function to generate unique file name for profile images
function generateUniqueImageName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || 'jpg';
  const sanitizedName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, '-');
  return `profile-images/${userId}/${timestamp}-${sanitizedName}.${extension}`;
}

// Helper function to upload image to Supabase storage
async function uploadImageToSupabase(file: File, fileName: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('images') // Your images bucket name
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwrite for profile images
      contentType: file.type
    });

  if (error) {
    console.error('Supabase image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function POST(request: NextRequest) {
  console.log('=== Profile Image Upload API Called ===');
  
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error(' Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can upload profile images.' },
        { status: 403 }
      );
    }

    console.log(' Token validated for userId:', payload.userId);

    // 2. Parse form data
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log(' Image received:', image.name, image.type, `${image.size} bytes`);

    // 3. Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed' },
        { status: 400 }
      );
    }

    console.log(' Image validation passed');

    // 4. Check if user and candidate exist
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        candidate: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 5. Delete old profile image from storage if exists
    if (user.profile_image_url) {
      try {
        console.log(' Deleting old profile image...');
        const oldUrl = user.profile_image_url;
        const urlParts = oldUrl.split('/');
        const bucketIndex = urlParts.findIndex(part => part === 'profile-images');
        
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(bucketIndex).join('/');
          
          const { error: deleteError } = await supabase.storage
            .from('images')
            .remove([filePath]);

          if (deleteError) {
            console.warn(' Failed to delete old image from storage:', deleteError);
          } else {
            console.log(' Old profile image deleted from storage');
          }
        }
      } catch (deleteError) {
        console.warn(' Error deleting old profile image:', deleteError);
        // Continue with upload even if old image deletion fails
      }
    }

    // 6. Upload new image to Supabase storage
    const fileName = generateUniqueImageName(image.name, payload.userId);
    console.log(' Uploading image to Supabase:', fileName);
    
    const imageUrl = await uploadImageToSupabase(image, fileName);
    console.log(' Image uploaded successfully:', imageUrl);

    // 7. Update user's profile image URL in database
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user's profile image URL
      const updated = await tx.user.update({
        where: { id: payload.userId },
        data: { profile_image_url: imageUrl }
      });

      // Update candidate's updated_at timestamp if candidate exists
      if (user.candidate) {
        await tx.candidate.update({
          where: { user_id: payload.userId },
          data: { updated_at: new Date() }
        });
      }

      return updated;
    });

    console.log(' Profile image URL updated in database');

    // 8. Prepare response data
    const responseData = {
      image_url: imageUrl,
      file_name: image.name,
      file_size: image.size,
      file_type: image.type,
      uploaded_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: responseData
    });

  } catch (error: any) {
    console.error(' Profile image upload error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to upload image')) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload profile image',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE method to remove profile image
export async function DELETE(request: NextRequest) {
  console.log('=== Profile Image Delete API Called ===');
  
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log(' Token validated for userId:', payload.userId);

    // 2. Get current user with profile image
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { 
        profile_image_url: true,
        candidate: {
          select: { user_id: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.profile_image_url) {
      return NextResponse.json(
        { error: 'No profile image to delete' },
        { status: 400 }
      );
    }

    // 3. Delete from Supabase storage
    try {
      console.log(' Deleting profile image from storage...');
      const imageUrl = user.profile_image_url;
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'profile-images');
      
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        const filePath = urlParts.slice(bucketIndex).join('/');
        
        const { error: deleteError } = await supabase.storage
          .from('images')
          .remove([filePath]);

        if (deleteError) {
          console.error(' Failed to delete image from storage:', deleteError);
          throw new Error(`Failed to delete image from storage: ${deleteError.message}`);
        }
        
        console.log(' Image deleted from storage successfully');
      }
    } catch (storageError) {
      console.error(' Storage deletion error:', storageError);
      // Continue with database update even if storage deletion fails
    }

    // 4. Update database to remove profile image URL
    await prisma.$transaction(async (tx) => {
      // Remove profile image URL from user
      await tx.user.update({
        where: { id: payload.userId },
        data: { profile_image_url: null }
      });

      // Update candidate's updated_at timestamp if candidate exists
      if (user.candidate) {
        await tx.candidate.update({
          where: { user_id: payload.userId },
          data: { updated_at: new Date() }
        });
      }
    });

    console.log(' Profile image URL removed from database');

    return NextResponse.json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error: any) {
    console.error(' Profile image delete error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete profile image',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}