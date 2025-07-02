// app/profile/create-profile/CVExtractor.tsx
'use client';

import { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { UnifiedProfileData, CVDocument } from '@/lib/data-transformer';

interface CVExtractorProps {
  onDataExtracted?: (data: UnifiedProfileData) => void;
}

export default function CVExtractor({ onDataExtracted }: CVExtractorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<CVDocument | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const { setValue } = useFormContext<UnifiedProfileData>();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setExtractionStatus('idle');
    setUploadedDocument(null);
  };

  const processCV = useCallback(async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setExtractionStatus('processing');

    try {
      console.log('🚀 Starting CV processing...');
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai/process-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process CV');
      }

      const result = await response.json();
      console.log('✅ CV processing result:', result);

      if (!result.success) {
        throw new Error(result.error || 'CV processing failed');
      }

      const { extractedData, resumeUrl, validation } = result;

      // Set uploaded document info
      if (extractedData.cv_documents?.[0]) {
        setUploadedDocument(extractedData.cv_documents[0]);
      }

      // Populate all form fields with extracted data
      console.log('📝 Populating form fields...');
      
      // Basic Info
      setValue('first_name', extractedData.first_name || '');
      setValue('last_name', extractedData.last_name || '');
      setValue('email', extractedData.email || '');
      setValue('phone', extractedData.phone || '');
      setValue('location', extractedData.location || '');
      setValue('linkedin_url', extractedData.linkedin_url || '');
      setValue('github_url', extractedData.github_url || '');
      setValue('portfolio_url', extractedData.portfolio_url || '');
      setValue('personal_website', extractedData.personal_website || '');
      setValue('bio', extractedData.bio || '');
      setValue('about', extractedData.about || '');
      setValue('title', extractedData.title || '');
      setValue('years_of_experience', extractedData.years_of_experience || 0);
      setValue('current_position', extractedData.current_position || '');
      setValue('industry', extractedData.industry || '');

      // Work Experiences - Use correct field name
      if (extractedData.work_experiences?.length > 0) {
        setValue('work_experience', extractedData.work_experiences);
        console.log('✅ Set work experiences:', extractedData.work_experiences.length);
      }

      // Education - Use correct field name
      if (extractedData.educations?.length > 0) {
        setValue('education', extractedData.educations);
        console.log('✅ Set educations:', extractedData.educations.length);
      }

      // Certificates
      if (extractedData.certificates?.length > 0) {
        setValue('certificates', extractedData.certificates);
        console.log('✅ Set certificates:', extractedData.certificates.length);
      }

      // Projects
      if (extractedData.projects?.length > 0) {
        setValue('projects', extractedData.projects);
        console.log('✅ Set projects:', extractedData.projects.length);
      }

      // Awards
      if (extractedData.awards?.length > 0) {
        setValue('awards', extractedData.awards);
        console.log('✅ Set awards:', extractedData.awards.length);
      }

      // Volunteering
      if (extractedData.volunteering?.length > 0) {
        setValue('volunteering', extractedData.volunteering);
        console.log('✅ Set volunteering:', extractedData.volunteering.length);
      }

      // Skills
      if (extractedData.skills?.length > 0) {
        setValue('skills', extractedData.skills);
        console.log('✅ Set skills:', extractedData.skills.length);
      }

      // CV Documents
      if (extractedData.cv_documents?.length > 0) {
        setValue('cv_documents', extractedData.cv_documents);
        console.log('✅ Set CV documents:', extractedData.cv_documents.length);
      }

      setExtractionStatus('success');
      
      // Show validation warnings if any
      if (validation && !validation.isValid) {
        console.warn('⚠️ Validation warnings:', validation.errors);
        toast.warning(`Data extracted with ${validation.errors.length} warnings. Please review.`);
      } else {
        toast.success('CV processed successfully! All form fields have been populated.');
      }

      // Callback for parent component
      if (onDataExtracted) {
        onDataExtracted(extractedData);
      }

    } catch (error) {
      console.error('❌ CV processing error:', error);
      setExtractionStatus('error');
      toast.error(error instanceof Error ? error.message : 'Failed to process CV');
    } finally {
      setIsUploading(false);
    }
  }, [file, setValue, onDataExtracted]);

  const getStatusIcon = () => {
    switch (extractionStatus) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (extractionStatus) {
      case 'processing':
        return 'Processing your CV and extracting information...';
      case 'success':
        return 'CV processed successfully! Review and edit the information in each section below.';
      case 'error':
        return 'Failed to process CV. Please try again or fill the form manually.';
      default:
        return 'Upload your CV/Resume to automatically populate your profile information and store the document';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Label htmlFor="cv-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {getStatusMessage()}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Supported formats: PDF (Max 10MB)
              </span>
            </Label>
            <Input
              id="cv-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.type}
                  {uploadedDocument && (
                    <span className="ml-2 text-green-600">
                      ✓ Uploaded at {new Date(uploadedDocument.uploaded_at).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {extractionStatus !== 'success' && (
              <Button
                onClick={processCV}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process CV'
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {extractionStatus === 'success' && uploadedDocument && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                CV processed successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Document saved and data extracted. Review and edit the information in each section below.</p>
                <ul className="mt-1 list-disc list-inside">
                  <li>Document: {uploadedDocument.original_filename}</li>
                  <li>Size: {formatFileSize(uploadedDocument.file_size)}</li>
                  <li>Type: {uploadedDocument.file_type}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
