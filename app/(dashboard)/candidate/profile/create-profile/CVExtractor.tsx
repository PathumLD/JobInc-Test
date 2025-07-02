// app/(dashboard)/candidate/profile/create-profile/CVExtractor.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Eye, Star, X } from 'lucide-react';
import type { UnifiedProfileData, CVDocument } from '@/lib/data-transformer';

interface Resume {
  id: string;
  resume_url: string;
  is_primary: boolean;
  is_allow_fetch: boolean;
  uploaded_at: string;
  candidate: {
    first_name: string;
    last_name: string;
    user_id: string;
  };
}

interface CVExtractorProps {
  onDataExtracted?: (data: UnifiedProfileData) => void;
  onSectionComplete?: (section: string) => void;
}

// Store files temporarily for upload when profile is created
interface TempCVFile {
  file: File;
  extractedData?: UnifiedProfileData;
  processedAt?: Date;
}

export default function CVExtractor({ onDataExtracted, onSectionComplete }: CVExtractorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tempFiles, setTempFiles] = useState<TempCVFile[]>([]);
  const [isProcessingCV, setIsProcessingCV] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const { setValue, getValues } = useFormContext<UnifiedProfileData>();

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
  };

  const processCV = useCallback(async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsProcessingCV(true);
    setExtractionStatus('processing');

    try {
      console.log('🚀 Starting CV processing for file:', file.name);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Create FormData with the file
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai/process-cv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

      const { extractedData, validation } = result;

      // Populate all form fields with extracted data
      console.log('📝 Populating form fields...');
      
      // Basic Info
      setValue('first_name', extractedData.first_name || '');
      setValue('last_name', extractedData.last_name || '');
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

      // Work Experiences
      if (extractedData.work_experience?.length > 0) {
        setValue('work_experience', extractedData.work_experience);
        console.log('✅ Set work experiences:', extractedData.work_experience.length);
      }

      // Education
      if (extractedData.education?.length > 0) {
        setValue('education', extractedData.education);
        console.log('✅ Set education:', extractedData.education.length);
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

      // Skills - Handle both simple and candidate skills
      if (extractedData.candidate_skills?.length > 0) {
        setValue('candidate_skills', extractedData.candidate_skills);
        // Also set simple skills array for backward compatibility
        const skillNames = extractedData.candidate_skills.map(skill => skill.skill_name);
        setValue('skills', skillNames);
        console.log('✅ Set skills:', extractedData.candidate_skills.length);
      }

      // Accomplishments
      if (extractedData.accomplishments?.length > 0) {
        setValue('accomplishments', extractedData.accomplishments);
        console.log('✅ Set accomplishments:', extractedData.accomplishments.length);
      }

      // Store the file temporarily for later upload
      const tempFile: TempCVFile = {
        file: file,
        extractedData: extractedData,
        processedAt: new Date()
      };

      setTempFiles(prev => [...prev, tempFile]);

      // Create a CVDocument for the form data (will be used when profile is created)
      const cvDocument: CVDocument = {
        id: `temp_${Date.now()}`, // Temporary ID
        resume_url: '', // Will be set after upload
        original_filename: file.name,
        file_size: file.size,
        file_type: file.type,
        is_primary: tempFiles.length === 0, // First file is primary
        is_allow_fetch: true,
        uploaded_at: new Date().toISOString(),
      };

      // Update cv_documents in form
      const currentCvDocuments = getValues('cv_documents') || [];
      setValue('cv_documents', [...currentCvDocuments, cvDocument]);

      setExtractionStatus('success');
      
      // Show validation warnings if any
      if (validation && !validation.isValid) {
        console.warn('⚠️ Validation warnings:', validation.errors);
        toast.warning(`Data extracted with ${validation.errors.length} warnings. Please review.`);
      } else {
        toast.success('CV processed successfully! All form fields have been populated.');
      }

      // Clear the file input
      setFile(null);
      const fileInput = document.getElementById('cv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Callback for parent component
      if (onDataExtracted) {
        onDataExtracted(extractedData);
      }

      // Move to next section after successful extraction
      // if (onSectionComplete) {
      //   setTimeout(() => {
      //     onSectionComplete('Work_Experiences');
      //   }, 1500);
      // }

    } catch (error) {
      console.error('❌ CV processing error:', error);
      setExtractionStatus('error');
      toast.error(error instanceof Error ? error.message : 'Failed to process CV');
    } finally {
      setIsProcessingCV(false);
    }
  }, [file, setValue, getValues, onDataExtracted, onSectionComplete, tempFiles.length]);

  const removeTempFile = (index: number) => {
    setTempFiles(prev => prev.filter((_, i) => i !== index));
    
    // Update cv_documents in form
    const currentCvDocuments = getValues('cv_documents') || [];
    const updatedCvDocuments = currentCvDocuments.filter((_, i) => i !== index);
    setValue('cv_documents', updatedCvDocuments);
    
    toast.success('File removed');
  };

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
        return 'Upload your CV/Resume to automatically populate your profile information';
    }
  };

  // Export functions to manage temp files for profile creation
  (window as any).getTempCVFiles = () => tempFiles;
  (window as any).clearTempCVFiles = () => {
    setTempFiles([]);
    setValue('cv_documents', []);
  };

  return (
    <div className="space-y-6">
      {/* Show processed files */}
      {tempFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Processed CV Files</h3>
          <div className="space-y-3">
            {tempFiles.map((tempFile, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">
                      {tempFile.file.name}
                      {index === 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Primary
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Processed: {tempFile.processedAt?.toLocaleString()} • {formatFileSize(tempFile.file.size)}
                    </p>
                    <p className="text-xs text-green-600">
                      Data extracted successfully. Will be uploaded when profile is created.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTempFile(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload New Resume */}
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
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-md border">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={processCV}
              disabled={isProcessingCV}
              className="w-full"
            >
              {isProcessingCV ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing CV...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Extract Data from CV
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Processing Status */}
      {extractionStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                CV processed successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Data extracted and populated in form fields. CV file will be uploaded when you create your profile.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {extractionStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                CV processing failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Unable to extract data from CV. Please fill out the form manually or try uploading a different file.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessingCV && extractionStatus === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Processing CV...
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Extracting information from your resume. This may take a few moments.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}