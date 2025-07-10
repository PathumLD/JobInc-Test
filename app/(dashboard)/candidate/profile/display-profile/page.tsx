// app/(dashboard)/candidate/profile/display-profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, AlertCircle, User, RefreshCw, ArrowBigLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthGuard, getUserFromToken } from '@/app/api/auth/authGuard';

// Import all section components
import ProfileHeader from './component/profile-header';
import ProfileCompletion from './component/profile-completion';
import AboutSection from './component/about-section';
import ExperienceSection from './component/experience-section';
import EducationSection from './component/education-section';
import SkillsSection from './component/skills-section';
import ProjectsSection from './component/projects-section';
import CertificatesSection from './component/certificates-section';
import AwardsSection from './component/awards-section';
import VolunteeringSection from './component/volunteering-section';

// Import types
import { CompleteProfileData, ProfileDisplayResponse } from '@/lib/types/candidate/profile/profile-display';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

export default function DisplayProfilePage() {
  const [profileData, setProfileData] = useState<CompleteProfileData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
    retryCount: 0
  });
  const [userEmail, setUserEmail] = useState<string>('');

  const router = useRouter();

  // Call useAuthGuard to ensure user is authenticated
  useAuthGuard('candidate');

  // Fetch profile data
  const fetchProfileData = async (isRetry = false) => {
    try {
      if (isRetry) {
        setLoadingState(prev => ({ 
          ...prev, 
          isLoading: true, 
          error: null,
          retryCount: prev.retryCount + 1 
        }));
      } else {
        setLoadingState({ isLoading: true, error: null, retryCount: 0 });
      }

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log('🔍 Fetching profile data...');
      
      const response = await fetch('/api/candidate/profile/display-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure fresh data
      });

      console.log('📡 Profile API response:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }
        
        if (response.status === 404) {
          console.log(' No profile found, redirecting to create profile');
          toast.info('No profile found. Let\'s create your profile!');
          router.push('/candidate/profile/create-profile');
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ProfileDisplayResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Invalid response format');
      }

      console.log(' Profile data loaded successfully:', {
        name: `${result.data.candidate.first_name} ${result.data.candidate.last_name}`,
        completion: result.data.profile_stats.completion_percentage,
        sections: {
          experiences: result.data.work_experiences.length,
          education: result.data.education.length,
          skills: result.data.skills.length,
          projects: result.data.projects.length,
          certificates: result.data.certificates.length,
          awards: result.data.awards.length,
          volunteering: result.data.volunteering.length,
        }
      });

      setProfileData(result.data);
      setLoadingState({ isLoading: false, error: null, retryCount: 0 });

    } catch (error) {
      console.error(' Profile fetch error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load profile data';

      setLoadingState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));

      if (!isRetry) {
        toast.error(`Failed to load profile: ${errorMessage}`);
      }
    }
  };

  // Get user email from token
  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setUserEmail(user.email || '');
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Loading state
  if (loadingState.isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <div className="text-lg text-gray-700">
              {loadingState.retryCount > 0 ? 'Retrying...' : 'Loading your profile...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingState.error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Unable to Load Profile
            </h2>
            <p className="text-red-700 text-sm mb-4">
              {loadingState.error}
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/candidate/dashboard')}
                size="sm"
                disabled={loadingState.isLoading}
              >
                <ArrowBigLeft /> Back to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/candidate/profile/create-profile')}
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Create New Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No profile data
  if (!profileData) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              No Profile Found
            </h2>
            <p className="text-blue-700 text-sm mb-4">
              You haven't created a profile yet. Let's get started!
            </p>
            <Button 
              onClick={() => router.push('/candidate/profile/create-profile')}
              className="w-full"
            >
              <User className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Profile Display
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <Button 
              variant="outline"
              onClick={() => router.push('/candidate/dashboard')}
              size="sm"
              disabled={loadingState.isLoading}
            >
              <ArrowBigLeft />Back to Dashboard
            </Button>
          </div>

          {/* Profile Header - Hero Section */}
          <ProfileHeader 
            candidate={profileData.candidate} 
            userEmail={userEmail}
          />

          {/* Profile Completion Card */}
          <ProfileCompletion stats={profileData.profile_stats} />

          {/* About Section */}
          <AboutSection content={profileData.candidate.about} />

          {/* Experience Section */}
          <ExperienceSection experiences={profileData.work_experiences} />

          {/* Education Section */}
          <EducationSection education={profileData.education} />

          {/* Skills Section */}
          <SkillsSection skills={profileData.skills} />

          {/* Projects Section */}
          <ProjectsSection projects={profileData.projects} />

          {/* Certificates Section */}
          <CertificatesSection certificates={profileData.certificates} />

          {/* Awards Section */}
          <AwardsSection awards={profileData.awards} />

          {/* Volunteering Section */}
          <VolunteeringSection volunteering={profileData.volunteering} />

          {/* Profile Footer Info */}
          <div className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
            <p>
              Profile last updated: {' '}
              {profileData.profile_stats.last_updated 
                ? new Date(profileData.profile_stats.last_updated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric'
                  })
                : 'Never'
              }
            </p>
            <p className="mt-1">
              Profile completion: {profileData.profile_stats.completion_percentage}% • {' '}
              {profileData.profile_stats.skills_count} skills • {' '}
              {profileData.profile_stats.work_experience_count} experiences • {' '}
              {profileData.profile_stats.projects_count} projects • {' '}
              {profileData.profile_stats.certificates_count} certificates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}