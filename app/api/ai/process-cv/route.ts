// app/api/ai/process-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadResume } from '@/lib/supabase/upload';
import { processExtractedData } from '@/lib/cv-extraction';
import { DataTransformer } from '@/lib/data-transformer';
import type { CVDocument } from '@/lib/data-transformer';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    console.log('📤 Processing CV:', file.name, 'Size:', file.size);

    try {
      // 1. Upload the file to storage
      const resumeUrl = await uploadResume(file, session.user.id);
      console.log('✅ File uploaded successfully:', resumeUrl);

      // 2. Extract data from CV
      const extractedData = await processExtractedData(file);
      console.log('✅ Data extracted successfully');

      // 3. Transform extracted data to unified format
      const normalizedData = DataTransformer.normalizeExtractedData(extractedData);
      console.log('✅ Data normalized successfully');

      // 4. Create CV document record
      const cvDocument: CVDocument = {
        original_filename: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: resumeUrl,
        uploaded_at: new Date().toISOString(),
        is_primary: true,
      };

      // 5. Add CV document to normalized data
      normalizedData.cv_documents = [cvDocument];

      // 6. Validate the normalized data
      const validation = DataTransformer.validateProfileData(normalizedData);
      if (!validation.isValid) {
        console.warn('⚠️ Data validation warnings:', validation.errors);
      }

      return NextResponse.json({
        success: true,
        resumeUrl,
        extractedData: normalizedData,
        validation: validation,
        message: 'CV processed and data normalized successfully'
      });

    } catch (processingError) {
      console.error('❌ CV processing error:', processingError);
      return NextResponse.json(
        { 
          error: 'Failed to process CV',
          details: processingError instanceof Error ? processingError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ CV upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
