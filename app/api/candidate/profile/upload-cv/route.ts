// app/api/cv/upload/route.ts
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

// Helper function to generate unique file name
function generateUniqueFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-');
  return `resumes/${userId}/${timestamp}-${sanitizedName}.${extension}`;
}

// Helper function to upload file to Supabase storage
async function uploadToSupabase(file: File, fileName: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('resumes') // Your bucket name
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function POST(request: NextRequest) {
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

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can upload resumes.' },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const isPrimary = formData.get('is_primary') === 'true';
    const allowFetch = formData.get('is_allow_fetch') !== 'false'; // Default to true

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Validate file
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // 4. Check if candidate exists, create if doesn't exist
    let candidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId },
      include: { resumes: true }
    });

    if (!candidate) {
      // Create candidate if doesn't exist
      candidate = await prisma.candidate.create({
        data: {
          user_id: payload.userId,
          first_name: '',
          last_name: '',
          profile_completion_percentage: 0
        },
        include: { resumes: true }
      });
    }

    // 5. Upload file to Supabase storage
    const fileName = generateUniqueFileName(file.name, payload.userId);
    console.log('📤 Uploading file to Supabase:', fileName);
    
    const resumeUrl = await uploadToSupabase(file, fileName);
    console.log('✅ File uploaded successfully:', resumeUrl);

    // 6. Handle primary resume logic and save to database
    const result = await prisma.$transaction(async (tx) => {
      // If this resume is set as primary, make all other resumes non-primary
      if (isPrimary) {
        await tx.resume.updateMany({
          where: { candidate_id: payload.userId },
          data: { is_primary: false }
        });
      }

      // If this is the first resume and no primary is specified, make it primary
      const shouldBePrimary = isPrimary || candidate!.resumes.length === 0;

      // Create new resume record
      const newResume = await tx.resume.create({
        data: {
          candidate_id: payload.userId,
          resume_url: resumeUrl,
          is_primary: shouldBePrimary,
          is_allow_fetch: allowFetch,
          uploaded_at: new Date(),
        },
        include: {
          candidate: {
            select: {
              first_name: true,
              last_name: true,
              user_id: true
            }
          }
        }
      });

      // Update candidate's primary resume_url if this is the primary resume
      if (shouldBePrimary) {
        await tx.candidate.update({
          where: { user_id: payload.userId },
          data: { resume_url: resumeUrl }
        });
      }

      return newResume;
    });

    console.log('✅ Resume saved to database:', result.id);

    // 7. Prepare response data
    const cvDocument = {
      id: result.id,
      resume_url: resumeUrl,
      original_filename: file.name,
      file_size: file.size,
      file_type: file.type,
      is_primary: result.is_primary,
      is_allow_fetch: result.is_allow_fetch,
      uploaded_at: result.uploaded_at.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume: result,
        cvDocument: cvDocument,
        resumeUrl: resumeUrl
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ CV upload error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Resume already exists' },
          { status: 409 }
        );
      }
      if (error.message.includes('Failed to upload file')) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve candidate's resumes
export async function GET(request: NextRequest) {
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

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // 2. Fetch candidate's resumes
    const resumes = await prisma.resume.findMany({
      where: { candidate_id: payload.userId },
      orderBy: [
        { is_primary: 'desc' },
        { uploaded_at: 'desc' }
      ],
      include: {
        candidate: {
          select: {
            first_name: true,
            last_name: true,
            user_id: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: resumes
    });

  } catch (error) {
    console.error('❌ Get resumes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a resume
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

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

    // 2. Find resume and verify ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidate_id: payload.userId
      }
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found or access denied' },
        { status: 404 }
      );
    }

    // 3. Delete from storage and database
    await prisma.$transaction(async (tx) => {
      // Delete from database
      await tx.resume.delete({
        where: { id: resumeId }
      });

      // If this was the primary resume, update candidate's resume_url
      if (resume.is_primary) {
        // Find another resume to make primary
        const otherResume = await tx.resume.findFirst({
          where: { 
            candidate_id: payload.userId,
            id: { not: resumeId }
          },
          orderBy: { uploaded_at: 'desc' }
        });

        if (otherResume) {
          // Make the most recent resume primary
          await tx.resume.update({
            where: { id: otherResume.id },
            data: { is_primary: true }
          });

          await tx.candidate.update({
            where: { user_id: payload.userId },
            data: { resume_url: otherResume.resume_url }
          });
        } else {
          // No other resumes, clear the candidate's resume_url
          await tx.candidate.update({
            where: { user_id: payload.userId },
            data: { resume_url: null }
          });
        }
      }
    });

    // 4. Delete from Supabase storage (extract file path from URL)
    try {
      if (resume.resume_url) {
        const urlParts = resume.resume_url.split('/');
        const bucketIndex = urlParts.findIndex(part => part === 'resumes');
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/');
          
          const { error: deleteError } = await supabase.storage
            .from('resumes')
            .remove([filePath]);

          if (deleteError) {
            console.warn('Failed to delete file from storage:', deleteError);
          }
        }
      }
    } catch (storageError) {
      console.warn('Storage cleanup error:', storageError);
      // Don't fail the request if storage cleanup fails
    }

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete resume error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}