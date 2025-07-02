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

interface TempCVFile {
  file: File;
  extractedData?: any;
  processedAt?: Date;
}

export default function CreateProfilePage() {
  const [activeSection, setActiveSection] = useState('Basic_Info');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const methods = useForm<BasicInfoFormValues>();
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

  // Check authentication and decode token
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
    };

    checkAuth();
  }, [router]);

  const uploadCVFiles = async (tempFiles: TempCVFile[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < tempFiles.length; i++) {
      const tempFile = tempFiles[i];
      
      try {
        console.log(`📤 Uploading CV file ${i + 1}/${tempFiles.length}:`, tempFile.file.name);
        
        const formData = new FormData();
        formData.append('file', tempFile.file);
        formData.append('is_primary', (i === 0).toString()); // First file is primary
        formData.append('is_allow_fetch', 'true');

        const token = localStorage.getItem('token');
        const response = await fetch('/api/candidate/profile/upload-cv', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to upload ${tempFile.file.name}`);
        }

        const result = await response.json();
        uploadedUrls.push(result.data.resumeUrl);
        
        console.log(`✅ CV file uploaded successfully: ${tempFile.file.name}`);
        
      } catch (error) {
        console.error(`❌ Failed to upload ${tempFile.file.name}:`, error);
        throw error; // Re-throw to stop the process
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmitProfile = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
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

      // Get temp CV files from CVExtractor component
      const tempFiles: TempCVFile[] = (window as any).getTempCVFiles?.() || [];
      
      // Step 1: Upload CV files if any exist
      let uploadedUrls: string[] = [];
      if (tempFiles.length > 0) {
        toast.info('Uploading CV files...');
        uploadedUrls = await uploadCVFiles(tempFiles);
        
        // Update cv_documents with actual URLs
        const updatedCvDocuments = formData.cv_documents?.map((doc, index) => ({
          ...doc,
          resume_url: uploadedUrls[index] || '',
          id: `${Date.now()}_${index}`, // Generate proper ID
        })) || [];

        formData.cv_documents = updatedCvDocuments;
      }

      // Step 2: Create profile with all data including uploaded CV URLs
      toast.info('Creating profile...');
      
      const response = await fetch('/api/candidate/profile/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }
        
        if (response.status === 400 && responseData.errors) {
          toast.error(`Validation failed: ${responseData.errors.join(', ')}`);
          return;
        }
        
        throw new Error(responseData.error || 'Failed to create profile');
      }

      // Clear temp files after successful profile creation
      if ((window as any).clearTempCVFiles) {
        (window as any).clearTempCVFiles();
      }

      toast.success('Profile created successfully!');
      router.push('/candidate/profile/display-profile');
      
    } catch (error) {
      console.error('Profile creation error:', error);
      
      // If CV upload failed, show specific error
      if (error instanceof Error && error.message.includes('upload')) {
        toast.error(`CV upload failed: ${error.message}`);
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to create profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Checking authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Create Profile</h1>
          <div className="flex gap-4 overflow-x-auto py-2">
            {sections.map((section) => (
              <Button
                key={section}
                variant={activeSection === section ? 'default' : 'outline'}
                onClick={() => setActiveSection(section)}
                className="whitespace-nowrap"
              >
                {section.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <FormProvider {...methods}>
          {activeSection === 'Basic_Info' && (
            <div className="space-y-6">
              <CVExtractor onSectionComplete={setActiveSection} />
              <BasicInfoForm 
                initialData={{}}
                onUpdate={() => setActiveSection('Work_Experiences')}
                onNext={() => setActiveSection('Work_Experiences')}
              />
            </div>
          )}

          {activeSection === 'Work_Experiences' && (
            <WorkExperiencesForm
              onBack={() => setActiveSection('Basic_Info')}
              onNext={() => setActiveSection('Educations')}
            />
          )}

          {activeSection === 'Educations' && (
            <EducationsForm
              onBack={() => setActiveSection('Work_Experiences')}
              onNext={() => setActiveSection('Certificates')}
            />
          )}

          {activeSection === 'Certificates' && (
            <CertificatesForm
              onBack={() => setActiveSection('Educations')}
              onNext={() => setActiveSection('Projects')}
            />
          )}

          {activeSection === 'Projects' && (
            <ProjectsForm
              onBack={() => setActiveSection('Certificates')}
              onNext={() => setActiveSection('Awards')}
            />
          )}

          {activeSection === 'Awards' && (
            <AwardsForm
              onBack={() => setActiveSection('Projects')}
              onNext={() => setActiveSection('Volunteering')}
            />
          )}

          {activeSection === 'Volunteering' && (
            <VolunteeringForm
              onBack={() => setActiveSection('Awards')}
              onNext={() => setActiveSection('Skills')}
            />
          )}

          {activeSection === 'Skills' && (
            <SkillsForm
              onBack={() => setActiveSection('Volunteering')}
              onSubmit={handleSubmitProfile}
              isSubmitting={isSubmitting}
            />
          )}
        </FormProvider>
      </div>
    </div>
  );
}