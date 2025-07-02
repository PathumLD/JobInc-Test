// app/profile/create-profile/page.tsx
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
import { useAuthGuard } from '@/app/api/auth/authGuard';
import WorkExperiencesForm from './ExperienceForm';
import EducationsForm from './EducationForm';
import AwardsForm from './AwardForm';
import CertificatesForm from './CertificateForm';
import { jwtDecode } from 'jwt-decode';

export default function CreateProfilePage() {
  const [activeSection, setActiveSection] = useState('Basic_Info');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const methods = useForm<BasicInfoFormValues>();
  const router = useRouter();

  // Call useAuthGuard at the top level
  useAuthGuard();

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
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Decode JWT to verify and get user info
        const payload = jwtDecode<{ role: string; exp: number }>(token);
        
        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }

        // Verify user is a candidate
        if (payload.role !== 'candidate') {
          toast.error('Access denied. Only candidates can create profiles.');
          router.push(`/${payload.role}/dashboard`);
          return;
        }

        setUserRole(payload.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmitProfile = async () => {
    try {
      const formData = methods.getValues();
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Authentication required. Please login again.');
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/candidate/profile/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include token in request
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to create profile');
      }

      toast.success('Profile created successfully!');
      router.push('/candidate/profile/display-profile');
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  // Show loading or nothing while checking authentication
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
            />
          )}
        </FormProvider>
      </div>
    </div>
  );
}