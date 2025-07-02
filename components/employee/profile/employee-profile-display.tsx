// components/employee/profile/employee-profile-display.tsx
'use client';

import { useEffect, useState } from 'react';
import { CandidateProfile } from './candidate-profile-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CandidateProfileDisplay() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await fetch('/api/candidate/profile/display-profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.candidate);
      } catch (err: any) {
        console.error('Fetch profile error:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button asChild>
            <Link href="/login">Login to Continue</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">You haven't created a profile yet.</p>
          <Button asChild>
            <Link href="/candidate/profile/profile">Create Your Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {profile.first_name} {profile.last_name}
          </h1>
          <h2 className="text-xl text-gray-600 mt-1">{profile.title}</h2>
        </div>
        <Button asChild variant="outline">
          <Link href="/candidate/profile/edit-profile">Edit Profile</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/employee">Go to dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Profile Column */}
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
          </section>

          {/* Experience Section */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800">Years of Experience</h4>
                <p className="text-gray-600">{profile.years_of_experience || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Experience Level</h4>
                <p className="text-gray-600 capitalize">{profile.experience_level?.replace('_', ' ') || 'Not specified'}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Details Card */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-800">Location</h4>
                <p className="text-gray-600">{profile.location || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Remote Preference</h4>
                <p className="text-gray-600 capitalize">{profile.remote_preference?.replace('_', ' ') || 'Flexible'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Salary Expectations</h4>
                <p className="text-gray-600">
                  {profile.expected_salary_min && profile.expected_salary_max 
                    ? `${profile.currency} ${profile.expected_salary_min} - ${profile.expected_salary_max}`
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Availability</h4>
                <p className="text-gray-600 capitalize">
                  {profile.availability_status?.replace('_', ' ') || 'Available'}
                  {profile.availability_date && ` from ${new Date(profile.availability_date).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </section>

          {/* Links Section */}
          {(profile.linkedin_url || profile.github_url || profile.portfolio_url || profile.personal_website) && (
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Links</h3>
              <div className="space-y-2">
                {profile.linkedin_url && (
                  <div>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
                {profile.github_url && (
                  <div>
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      GitHub
                    </a>
                  </div>
                )}
                {profile.portfolio_url && (
                  <div>
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Portfolio
                    </a>
                  </div>
                )}
                {profile.personal_website && (
                  <div>
                    <a href={profile.personal_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Personal Website
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Resume Section */}
          {profile.resume_url && (
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resume</h3>
              <Button asChild variant="outline" className="w-full">
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                  View Resume
                </a>
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}