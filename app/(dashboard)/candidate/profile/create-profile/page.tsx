// app/(dashboard)/candidate/profile/create-profile/page.tsx
'use client'

import { Button } from '@/components/ui/button';
import BasicInfoForm from './BasicInfoForm';
import CVExtractor from './CVExtractor';
import ProjectsForm from './ProjectsForm';
import SkillsForm from './SkillsForm';
import VolunteeringForm from './VolunteeringForm';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { BasicInfoFormValues } from './BasicInfoForm';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthGuard, getUserFromToken } from '@/app/api/auth/authGuard';
import WorkExperiencesForm from './ExperienceForm';
import EducationsForm from './EducationForm';
import AwardsForm from './AwardForm';
import CertificatesForm from './CertificateForm';
import { Loader2, UserCheck, FileText, CheckCircle, AlertCircle } from 'lucide-react';

// Define the complete form data type
interface CompleteFormData extends BasicInfoFormValues {
  // CV-related fields for form state persistence
  cv_documents: any[];
  cv_processing_status: 'none' | 'completed' | 'failed';
  cv_extraction_completed: boolean;
  uploaded_cv_ids: string[];
}

export default function CreateProfilePage() {
  const [activeSection, setActiveSection] = useState('Basic_Info');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  
  // Enhanced form with CV state management
  const methods = useForm<CompleteFormData>({
    defaultValues: {
      // Basic form defaults
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      current_position: '',
      industry: '',
      years_of_experience: 0,
      bio: '',
      about: '',
      personal_website: '',
      portfolio_url: '',
      github_url: '',
      linkedin_url: '',
      
      // Array defaults
      work_experience: [],
      education: [],
      certificates: [],
      projects: [],
      awards: [],
      volunteering: [],
      skills: [],
      candidate_skills: [],
      accomplishments: [],
      
      // CV-related defaults
      cv_documents: [],
      cv_processing_status: 'none',
      cv_extraction_completed: false,
      uploaded_cv_ids: [],
    }
  });

  const router = useRouter();

  // Call useAuthGuard with required role
  useAuthGuard('candidate');

  const sections = [
    'Basic_Info',
    'Work_Experiences',
    'Educations',
    'Certificates',
    'Projects',
    'Awards',
    'Volunteering',
    'Skills'
  ];

  // Watch form state for CV-related data
  const cvDocuments = methods.watch('cv_documents') || [];
  const cvProcessingStatus = methods.watch('cv_processing_status') || 'none';
  const cvExtractionCompleted = methods.watch('cv_extraction_completed') || false;
  const uploadedCvIds = methods.watch('uploaded_cv_ids') || [];

  // Load existing CV data from localStorage/sessionStorage (optional enhancement)
  const loadPersistedFormData = () => {
    try {
      const persistedData = sessionStorage.getItem('profile_form_data');
      if (persistedData) {
        const parsedData = JSON.parse(persistedData);
        console.log('📋 Loading persisted form data:', parsedData);
        
        // Reset form with persisted data
        methods.reset(parsedData);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load persisted form data:', error);
    }
    return false;
  };

  // Persist form data to sessionStorage
  const persistFormData = () => {
    try {
      const formData = methods.getValues();
      sessionStorage.setItem('profile_form_data', JSON.stringify(formData));
      console.log('💾 Form data persisted to sessionStorage');
    } catch (error) {
      console.warn('⚠️ Failed to persist form data:', error);
    }
  };

  // Check if profile already exists
  const checkProfileExists = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log('🔍 Checking if profile already exists...');
      
      const response = await fetch('/api/candidate/profile/check-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Profile check result:', data);
        
        if (data.exists) {
          console.log('✅ Profile exists, redirecting to display profile...');
          setProfileExists(true);
          
          // Clear any persisted form data
          sessionStorage.removeItem('profile_form_data');
          
          // Show message and redirect
          toast.info('You already have a profile. Redirecting to your profile page...', {
            duration: 3000,
          });
          
          setTimeout(() => {
            router.push('/candidate/profile/display-profile');
          }, 2000);
        } else {
          console.log('❌ No profile found, user can create one');
          setProfileExists(false);
          
          // Try to load any persisted form data
          const dataLoaded = loadPersistedFormData();
          if (dataLoaded) {
            toast.info('Previous form data restored. You can continue where you left off.');
          }
        }
      } else if (response.status === 401) {
        console.log('🔐 Authentication required');
        localStorage.removeItem('token');
        sessionStorage.removeItem('profile_form_data');
        router.push('/auth/login');
      } else {
        console.warn('⚠️ Profile check failed, allowing creation attempt');
        setProfileExists(false);
      }
    } catch (error) {
      console.error('❌ Error checking profile:', error);
      setProfileExists(false);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  // Check authentication and profile existence
  useEffect(() => {
    const checkAuth = () => {
      const user = getUserFromToken();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Verify user is a candidate
      if (user.role !== 'candidate') {
        toast.error('Access denied. Only candidates can create profiles.');
        router.push(`/${user.role}/dashboard`);
        return;
      }

      setUserRole(user.role);
      setIsAuthenticated(true);
      
      // Check if profile already exists
      checkProfileExists();
    };

    checkAuth();
  }, [router]);

  // Initialize form state
  useEffect(() => {
    if (isAuthenticated && !isCheckingProfile && !profileExists && !formInitialized) {
      console.log('🚀 Initializing form state...');
      setFormInitialized(true);
    }
  }, [isAuthenticated, isCheckingProfile, profileExists, formInitialized]);

  // Auto-save form data on section change
  useEffect(() => {
    if (formInitialized) {
      persistFormData();
    }
  }, [activeSection, formInitialized]);

  // Handle section navigation with data persistence
  const handleSectionChange = (section: string) => {
    console.log(`🔄 Navigating to section: ${section}`);
    persistFormData();
    setActiveSection(section);
    
    // Show CV status reminder if switching away from Basic_Info
    if (section !== 'Basic_Info' && cvDocuments.length > 0) {
      const statusMessage = cvExtractionCompleted ? 
        'CV data is preserved across sections' : 
        'CV uploaded but extraction failed - manual entry required';
      
      toast.info(statusMessage, { duration: 2000 });
    }
  };

  // Enhanced CV data extraction handler
  const handleCVDataExtracted = (extractedData: any) => {
    console.log('🤖 CV data extracted and applied to form:', extractedData);
    
    // Data is already set in CVExtractor, but we can add additional logic here
    toast.success('CV data extracted successfully! Navigate through sections to review and edit.');
    
    // Persist the updated form data
    persistFormData();
  };

  const handleSubmitProfile = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Get all form data including CV metadata
      const formData = methods.getValues();
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Authentication required. Please login again.');
        router.push('/auth/login');
        return;
      }

      // Validate required fields
      if (!formData.first_name || !formData.last_name) {
        toast.error('First name and last name are required.');
        setActiveSection('Basic_Info');
        return;
      }

      if (!formData.title) {
        toast.error('Professional title is required.');
        setActiveSection('Basic_Info');
        return;
      }

      console.log('🚀 Creating profile with form data...');
      console.log('📄 CV Documents to be linked:', formData.cv_documents);
      console.log('🔄 CV Processing Status:', formData.cv_processing_status);

      // Show loading toast
      const loadingToast = toast.loading('Creating your profile...', {
        duration: 30000,
      });
      
      // Prepare request payload with CV data
      const requestPayload = {
        profileData: {
          ...formData,
          // Ensure CV documents are included
          cv_documents: formData.cv_documents || [],
          // Remove form-specific fields that aren't needed in the API
          cv_processing_status: undefined,
          cv_extraction_completed: undefined,
          uploaded_cv_ids: undefined,
        }
      };

      console.log('📤 Sending profile creation request...');
      
      const response = await fetch('/api/candidate/profile/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestPayload),
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      console.log('📨 Response received:', response.status, response.statusText);

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          sessionStorage.removeItem('profile_form_data');
          router.push('/auth/login');
          return;
        }
        
        if (response.status === 400 && responseData.errors) {
          toast.error(`Validation failed: ${responseData.errors.join(', ')}`);
          return;
        }

        if (response.status === 409) {
          toast.error('Profile already exists for this user.');
          sessionStorage.removeItem('profile_form_data');
          router.push('/candidate/profile/display-profile');
          return;
        }

        if (response.status === 408) {
          toast.error('Request timeout. Please try again.');
          return;
        }
        
        throw new Error(responseData.error || 'Failed to create profile');
      }

      console.log('✅ Profile creation response:', responseData);

      // Check uploaded CVs and creation details
      const { uploadedCVs, skillsCreated } = responseData.data;
      
      // Clear persisted form data on success
      sessionStorage.removeItem('profile_form_data');
      
      // Enhanced success message
      let successMessage = '🎉 Profile created successfully!';
      
      if (uploadedCVs?.length > 0) {
        successMessage += ` ${uploadedCVs.length} CV file(s) are linked to your profile.`;
      }
      
      if (skillsCreated > 0) {
        successMessage += ` ${skillsCreated} skills were processed.`;
      }
      
      if (cvExtractionCompleted) {
        successMessage += ' CV data was successfully extracted and saved.';
      }
      
      toast.success(successMessage, {
        duration: 5000,
      });

      console.log('📄 Profile creation summary:', {
        linkedCVs: uploadedCVs?.length || 0,
        skillsCreated: skillsCreated || 0,
        cvExtracted: cvExtractionCompleted
      });

      // Add a small delay before redirect
      setTimeout(() => {
        router.push('/candidate/profile/display-profile');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          toast.error('🌐 Network error. Please check your connection and try again.', {
            duration: 6000,
          });
        } else {
          toast.error(`❌ ${error.message || 'Failed to create profile. Please try again.'}`, {
            duration: 6000,
          });
        }
      } else {
        toast.error('❌ Failed to create profile. Please try again.', {
          duration: 6000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication and profile
  if (!isAuthenticated || isCheckingProfile) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="text-lg">
              {!isAuthenticated ? 'Checking authentication...' : 'Checking profile status...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show profile exists message
  if (profileExists) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center space-y-4">
            <UserCheck className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profile Already Exists</h2>
              <p className="text-gray-600 mt-2">
                You already have a candidate profile. Redirecting to your profile page...
              </p>
            </div>
            <Button 
              onClick={() => router.push('/candidate/profile/display-profile')}
              className="mt-4"
            >
              Go to My Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header with CV Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Create Profile</h1>
            
            {/* CV Status Indicator */}
            {cvDocuments.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                {cvProcessingStatus === 'completed' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">CV Data Extracted</span>
                  </>
                )}
                {cvProcessingStatus === 'failed' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700">CV Uploaded</span>
                  </>
                )}
                {cvProcessingStatus === 'none' && (
                  <>
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">CV Uploaded</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Section Navigation */}
          <div className="flex gap-4 overflow-x-auto py-2">
            {sections.map((section) => (
              <Button
                key={section}
                variant={activeSection === section ? 'default' : 'outline'}
                onClick={() => handleSectionChange(section)}
                className="whitespace-nowrap"
                disabled={isSubmitting}
              >
                {section.replace('_', ' ')}
              </Button>
            ))}
          </div>
          
          {/* Progress Indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((sections.indexOf(activeSection) + 1) / sections.length) * 100}%` 
              }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {sections.indexOf(activeSection) + 1} of {sections.length}
          </p>
        </div>

        {/* Form Provider with Enhanced State Management */}
        <FormProvider {...methods}>
          {activeSection === 'Basic_Info' && (
            <div className="space-y-6">
              <CVExtractor 
                onDataExtracted={handleCVDataExtracted}
                onSectionComplete={handleSectionChange}
              />
              <BasicInfoForm 
                initialData={{}}
                onUpdate={(data) => {
                  console.log('📝 Basic info updated:', data);
                  persistFormData();
                }}
                onNext={() => handleSectionChange('Work_Experiences')}
              />
            </div>
          )}

          {activeSection === 'Work_Experiences' && (
            <WorkExperiencesForm
              onBack={() => handleSectionChange('Basic_Info')}
              onNext={() => handleSectionChange('Educations')}
            />
          )}

          {activeSection === 'Educations' && (
            <EducationsForm
              onBack={() => handleSectionChange('Work_Experiences')}
              onNext={() => handleSectionChange('Certificates')}
            />
          )}

          {activeSection === 'Certificates' && (
            <CertificatesForm
              onBack={() => handleSectionChange('Educations')}
              onNext={() => handleSectionChange('Projects')}
            />
          )}

          {activeSection === 'Projects' && (
            <ProjectsForm
              onBack={() => handleSectionChange('Certificates')}
              onNext={() => handleSectionChange('Awards')}
            />
          )}

          {activeSection === 'Awards' && (
            <AwardsForm
              onBack={() => handleSectionChange('Projects')}
              onNext={() => handleSectionChange('Volunteering')}
            />
          )}

          {activeSection === 'Volunteering' && (
            <VolunteeringForm
              onBack={() => handleSectionChange('Awards')}
              onNext={() => handleSectionChange('Skills')}
            />
          )}

          {activeSection === 'Skills' && (
            <SkillsForm
              onBack={() => handleSectionChange('Volunteering')}
              onSubmit={handleSubmitProfile}
              isSubmitting={isSubmitting}
            />
          )}
        </FormProvider>

        {/* CV Data Summary */}
        {cvDocuments.length > 0 && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="font-medium mb-2">CV Data Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Files:</span>
                <span className="ml-2 font-medium">{cvDocuments.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium capitalize">{cvProcessingStatus}</span>
              </div>
              <div>
                <span className="text-gray-600">Extracted:</span>
                <span className="ml-2 font-medium">{cvExtractionCompleted ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-600">Preserved:</span>
                <span className="ml-2 font-medium text-green-600">✓ Yes</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay when submitting */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div>
                  <h3 className="text-lg font-medium">Creating Profile...</h3>
                  <p className="text-sm text-gray-600">
                    {cvDocuments.length > 0 ? 
                      `Processing profile with ${cvDocuments.length} CV file(s)...` : 
                      'Please wait while we process your information...'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}