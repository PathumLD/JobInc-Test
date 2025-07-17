'use client';

import { useRouter } from 'next/navigation';
import CreateJobForm from '@/components/mis/jobs/CreateJobForm';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthGuard } from '@/app/api/auth/authGuard';

export default function CreateJobPage() {
  const router = useRouter();
  
  // Protect this page - only MIS users can access
  useAuthGuard('mis');

  const handleJobCreated = (jobId: string) => {
    // Redirect to job details or jobs list after successful creation
    router.push(`/mis/jobs/jobs/${jobId}`);
    
    // You could also show a success toast/notification here
    // toast.success('Job created successfully!');
  };

  const handleCancel = () => {
    // Navigate back to jobs list
    router.push('/mis/jobs/jobs');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/mis/jobs">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center">
                <Plus className="h-5 w-5 text-blue-600 mr-2" />
                <h1 className="text-lg font-semibold text-gray-900">Create Job</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateJobForm 
          onSuccess={handleJobCreated}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}