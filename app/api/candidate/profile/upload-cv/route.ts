import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadResume } from '@/lib/supabase/upload';
import { processExtractedData } from '@/lib/cv-extraction';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    try {
      // Upload the file to Supabase storage
      const resumeUrl = await uploadResume(file, session.user.id);

      // Extract data from CV
      const extractedData = await processExtractedData(file);

      return NextResponse.json({
        resumeUrl,
        extractedData
      });
    } catch (error) {
      console.error('CV processing error:', error);
      return NextResponse.json(
        { error: 'Failed to process CV' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 