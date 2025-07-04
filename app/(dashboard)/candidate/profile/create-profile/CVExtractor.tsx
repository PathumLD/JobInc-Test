// app/(dashboard)/candidate/profile/create-profile/CVExtractor.tsx

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Info } from 'lucide-react';
import type { UnifiedProfileData, CVDocument } from '@/lib/data-transformer';

interface CVExtractorProps {
  onDataExtracted?: (data: UnifiedProfileData) => void;
  onSectionComplete?: (section: string) => void;
}

interface UploadedCV {
  id: string;
  resume_url: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  is_primary: boolean;
  is_allow_fetch: boolean;
  uploaded_at: string;
  extractedData?: UnifiedProfileData;
}

export default function CVExtractor({ onDataExtracted, onSectionComplete }: CVExtractorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const { setValue, getValues, watch } = useFormContext<UnifiedProfileData>();

  // Watch form state for CV-related data
  const cvDocuments = watch('cv_documents') || [];
  const cvProcessingStatus = watch('cv_processing_status') || 'none';
  const cvExtractionCompleted = watch('cv_extraction_completed') || false;
  const uploadedCvIds = watch('uploaded_cv_ids') || [];

  // Local state for uploaded CVs (derived from form state)
  const [uploadedCVs, setUploadedCVs] = useState<UploadedCV[]>([]);

  // Load existing CV data from form state on component mount
  useEffect(() => {
    const existingCvDocuments = getValues('cv_documents') || [];
    const existingCvStatus = getValues('cv_processing_status') || 'none';
    
    if (existingCvDocuments.length > 0) {
      console.log(' Loading existing CV data from form state:', existingCvDocuments);
      
      // Convert CVDocument to UploadedCV format
      const existingUploadedCVs: UploadedCV[] = existingCvDocuments.map(doc => ({
        id: doc.id,
        resume_url: doc.resume_url,
        original_filename: doc.original_filename,
        file_size: doc.file_size,
        file_type: doc.file_type,
        is_primary: doc.is_primary,
        is_allow_fetch: doc.is_allow_fetch,
        uploaded_at: doc.uploaded_at,
        extractedData: undefined // We don't store extracted data in CV documents
      }));
      
      setUploadedCVs(existingUploadedCVs);
      
      // Set extraction status based on form state
      if (existingCvStatus === 'completed') {
        setExtractionStatus('success');
      } else if (existingCvStatus === 'failed') {
        setExtractionStatus('error');
      }
    }
  }, [getValues]);

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

  const processAndUploadCV = useCallback(async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setExtractionStatus('processing');

    try {
      console.log(' Starting CV processing and upload for:', file.name);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Step 1: Upload CV file to storage first
      console.log(' Step 1: Uploading CV to storage...');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('is_primary', String(uploadedCVs.length === 0)); // First file is primary
      uploadFormData.append('is_allow_fetch', 'true');

      const uploadResponse = await fetch('/api/candidate/profile/upload-cv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error || 'Failed to upload CV');
      }

      const uploadResult = await uploadResponse.json();
      console.log(' CV uploaded to storage:', uploadResult);

      // Step 2: Process CV with AI to extract data
      console.log(' Step 2: Processing CV with AI...');
      const processFormData = new FormData();
      processFormData.append('file', file);

      const processResponse = await fetch('/api/ai/process-cv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: processFormData,
      });

      // Create CV document object
      const cvDocument: CVDocument = {
        id: uploadResult.data.resume.id,
        resume_url: uploadResult.data.resumeUrl,
        original_filename: file.name,
        file_size: file.size,
        file_type: file.type,
        is_primary: uploadResult.data.resume.is_primary,
        is_allow_fetch: uploadResult.data.resume.is_allow_fetch,
        uploaded_at: uploadResult.data.resume.uploaded_at,
      };

      // Create uploaded CV object
      const uploadedCV: UploadedCV = {
        id: uploadResult.data.resume.id,
        resume_url: uploadResult.data.resumeUrl,
        original_filename: file.name,
        file_size: file.size,
        file_type: file.type,
        is_primary: uploadResult.data.resume.is_primary,
        is_allow_fetch: uploadResult.data.resume.is_allow_fetch,
        uploaded_at: uploadResult.data.resume.uploaded_at,
      };

      if (!processResponse.ok) {
        const processError = await processResponse.json();
        console.warn(' AI processing failed, but file is uploaded:', processError);
        
        // Store CV data in form state even if AI processing fails
        const currentCvDocuments = getValues('cv_documents') || [];
        const currentUploadedCvIds = getValues('uploaded_cv_ids') || [];
        
        setValue('cv_documents', [...currentCvDocuments, cvDocument]);
        setValue('uploaded_cv_ids', [...currentUploadedCvIds, uploadResult.data.resume.id]);
        setValue('cv_processing_status', 'failed');
        setValue('cv_extraction_completed', false);
        
        setUploadedCVs(prev => [...prev, uploadedCV]);
        setExtractionStatus('error');
        setFile(null);
        
        toast.warning('CV uploaded successfully, but automatic data extraction failed. Please fill the form manually.');
        return;
      }

      const processResult = await processResponse.json();
      console.log(' AI processing result:', processResult);

      if (processResult.success && processResult.extractedData) {
        const { extractedData, validation } = processResult;

        // Step 3: Populate form fields with extracted data
        console.log(' Step 3: Populating form fields...');
        
        // Store extracted data in form state
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

        // Store other sections data
        if (extractedData.work_experience?.length > 0) {
          setValue('work_experience', extractedData.work_experience);
        }
        if (extractedData.education?.length > 0) {
          setValue('education', extractedData.education);
        }
        if (extractedData.certificates?.length > 0) {
          setValue('certificates', extractedData.certificates);
        }
        if (extractedData.projects?.length > 0) {
          setValue('projects', extractedData.projects);
        }
        if (extractedData.awards?.length > 0) {
          setValue('awards', extractedData.awards);
        }
        if (extractedData.volunteering?.length > 0) {
          setValue('volunteering', extractedData.volunteering);
        }
        if (extractedData.candidate_skills?.length > 0) {
          setValue('candidate_skills', extractedData.candidate_skills);
          const skillNames = extractedData.candidate_skills.map(skill => skill.skill_name).filter(name => name);
          setValue('skills', skillNames);
        }
        if (extractedData.accomplishments?.length > 0) {
          setValue('accomplishments', extractedData.accomplishments);
        }

        // Store CV metadata in form state
        const currentCvDocuments = getValues('cv_documents') || [];
        const currentUploadedCvIds = getValues('uploaded_cv_ids') || [];
        
        setValue('cv_documents', [...currentCvDocuments, cvDocument]);
        setValue('uploaded_cv_ids', [...currentUploadedCvIds, uploadResult.data.resume.id]);
        setValue('cv_processing_status', 'completed');
        setValue('cv_extraction_completed', true);

        // Store uploaded CV with extracted data
        uploadedCV.extractedData = extractedData;
        setUploadedCVs(prev => [...prev, uploadedCV]);
        setExtractionStatus('success');
        
        // Show validation warnings if any
        if (validation && !validation.isValid) {
          console.warn(' Validation warnings:', validation.errors);
          toast.warning(`Data extracted with ${validation.errors.length} warnings. Please review.`);
        } else {
          toast.success('CV uploaded and processed successfully! Data populated in form fields.');
        }

        // Callback for parent component
        if (onDataExtracted) {
          onDataExtracted(extractedData);
        }

        // Move to next section after successful extraction
        if (onSectionComplete) {
          setTimeout(() => {
            onSectionComplete('Work_Experiences');
          }, 1500);
        }
      } else {
        // AI processing returned no data
        const currentCvDocuments = getValues('cv_documents') || [];
        const currentUploadedCvIds = getValues('uploaded_cv_ids') || [];
        
        setValue('cv_documents', [...currentCvDocuments, cvDocument]);
        setValue('uploaded_cv_ids', [...currentUploadedCvIds, uploadResult.data.resume.id]);
        setValue('cv_processing_status', 'failed');
        setValue('cv_extraction_completed', false);
        
        setUploadedCVs(prev => [...prev, uploadedCV]);
        setExtractionStatus('error');
        
        toast.warning('CV uploaded successfully, but no data could be extracted. Please fill the form manually.');
      }

      // Clear the file input
      setFile(null);
      const fileInput = document.getElementById('cv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error(' CV processing/upload error:', error);
      setExtractionStatus('error');
      
      // Update form state to reflect error
      setValue('cv_processing_status', 'failed');
      setValue('cv_extraction_completed', false);
      
      toast.error(error instanceof Error ? error.message : 'Failed to process/upload CV');
    } finally {
      setIsProcessing(false);
    }
  }, [file, setValue, getValues, onDataExtracted, onSectionComplete, uploadedCVs.length]);

  const removeUploadedCV = async (cvId: string, index: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/candidate/profile/cv?id=${cvId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete CV');
      }

      // Remove from local state
      setUploadedCVs(prev => prev.filter((_, i) => i !== index));
      
      // Remove from form state
      const currentCvDocuments = getValues('cv_documents') || [];
      const currentUploadedCvIds = getValues('uploaded_cv_ids') || [];
      
      const updatedCvDocuments = currentCvDocuments.filter(doc => doc.id !== cvId);
      const updatedUploadedCvIds = currentUploadedCvIds.filter(id => id !== cvId);
      
      setValue('cv_documents', updatedCvDocuments);
      setValue('uploaded_cv_ids', updatedUploadedCvIds);
      
      // Update processing status if no CVs left
      if (updatedCvDocuments.length === 0) {
        setValue('cv_processing_status', 'none');
        setValue('cv_extraction_completed', false);
        setExtractionStatus('idle');
      }
      
      toast.success('CV removed successfully');
    } catch (error) {
      console.error(' Failed to remove CV:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove CV');
    }
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
        return 'Uploading CV and extracting information...';
      case 'success':
        return 'CV uploaded and processed successfully!';
      case 'error':
        return 'Failed to process CV. File uploaded but please fill form manually.';
      default:
        return 'Upload your CV/Resume to automatically populate your profile information';
    }
  };

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">CV Upload Information</h3>
            <p className="text-sm text-blue-700 mt-1">
              Upload your CV to automatically extract and populate profile information. 
              Files are immediately uploaded to secure cloud storage and linked to your account.
              Your CV data will be preserved when navigating between form sections.
            </p>
          </div>
        </div>
      </div> */}

      {/* Processing Status Indicator */}
      {cvProcessingStatus !== 'none' && (
        <div className={`p-3 rounded-lg border ${
          cvProcessingStatus === 'completed' ? 'bg-green-50 border-green-200' :
          cvProcessingStatus === 'failed' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            {cvProcessingStatus === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {cvProcessingStatus === 'failed' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
            <span className="text-sm font-medium">
              CV Processing Status: {cvProcessingStatus === 'completed' ? 'Completed' : 
                                   cvProcessingStatus === 'failed' ? 'Failed (Manual entry required)' : 
                                   'Processing...'}
            </span>
          </div>
        </div>
      )}

      {/* Show uploaded files */}
      {uploadedCVs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Uploaded CVs ({uploadedCVs.length})
          </h3>
          <div className="space-y-3">
            {uploadedCVs.map((cv, index) => (
              <div
                key={cv.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-800">
                      {cv.original_filename}
                      {cv.is_primary && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Primary
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-green-600">
                      Uploaded: {new Date(cv.uploaded_at).toLocaleString()} • {formatFileSize(cv.file_size)}
                    </p>
                    <p className="text-xs text-green-700">
                      ✅ Stored in cloud storage • {cv.extractedData ? 'Data extracted & saved in form' : 'Manual entry required'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeUploadedCV(cv.id, index)}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload New Resume */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Label htmlFor="cv-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {getStatusMessage()}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Supported formats: PDF only (Max 10MB)
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
              onClick={processAndUploadCV}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading & Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Extract Data
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {extractionStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                CV uploaded and processed successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your CV has been uploaded to secure cloud storage and data has been extracted to populate the form fields.
                  This data will be preserved when navigating between form sections.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {extractionStatus === 'error' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                CV uploaded but processing failed
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your CV has been successfully uploaded to secure storage, but automatic data extraction failed. 
                  Please fill out the form manually. Your uploaded CV will still be linked to your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && extractionStatus === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Uploading and processing CV...
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Uploading your CV to cloud storage and analyzing content. This may take a few moments.
                  Your data will be preserved during form navigation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}