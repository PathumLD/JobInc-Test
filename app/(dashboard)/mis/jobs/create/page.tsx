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
    router.push(`/mis/jobs/${jobId}`);
    
    // You could also show a success toast/notification here
    // toast.success('Job created successfully!');
  };

  const handleCancel = () => {
    // Navigate back to jobs list
    router.push('/mis/jobs');
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
            
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/mis/dashboard" className="hover:text-gray-700">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/mis/jobs" className="hover:text-gray-700">
                Jobs
              </Link>
              <span>/</span>
              <span className="text-gray-900">Create</span>
            </nav>
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

      {/* Help Section */}
      {/* <div className="max-w-4xl mx-auto px-6 pb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help?</h3>
            <div className="text-blue-700 space-y-2">
              <p className="text-sm">
                <strong>Company Information:</strong> Provide the company details including name, email, phone, and website for the job posting.
              </p>
              <p className="text-sm">
                <strong>Skills:</strong> Add relevant skills with appropriate proficiency levels to help match the right candidates.
              </p>
              <p className="text-sm">
                <strong>Status:</strong> Use "Draft" to save without publishing, or "Published" to make the job live immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}