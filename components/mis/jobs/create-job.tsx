// app/dashboard/mis/jobs/create/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import MisHeader from '@/components/mis/dashboard/header';
import MisSidebar from '@/components/mis/dashboard/sidebar';

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/mis/jobs/editor'), { ssr: false });

interface Company {
  id: string;
  name: string;
}

export default function CreateJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyId: '',
    title: '',
    description: '',
    jobType: 'full_time',
    experienceLevel: 'mid',
    location: '',
    remoteType: 'hybrid',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    applicationDeadline: '',
    customCompany: '',
    customContactEmail: '',
    customContactPhone: '',
    customWebsite: ''
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useCustomCompany, setUseCustomCompany] = useState(false);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        creatorType: 'mis_user',
        status: 'published'
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/mis/jobs/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create job');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MisHeader />
      <div className="flex flex-1">
        <MisSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Job Posting</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Selection */}
              <div className="space-y-2">
                <label className="block font-medium">Company</label>
                {!useCustomCompany ? (
                  <>
                    <Select 
                      name="companyId"
                      value={formData.companyId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setUseCustomCompany(true)}
                      className="text-sm"
                    >
                      + Add new company
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Input
                      name="customCompany"
                      placeholder="Company Name"
                      value={formData.customCompany}
                      onChange={handleChange}
                      required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        name="customContactEmail"
                        placeholder="Contact Email"
                        type="email"
                        value={formData.customContactEmail}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        name="customContactPhone"
                        placeholder="Contact Phone"
                        value={formData.customContactPhone}
                        onChange={handleChange}
                      />
                    </div>
                    <Input
                      name="customWebsite"
                      placeholder="Website URL"
                      value={formData.customWebsite}
                      onChange={handleChange}
                    />
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setUseCustomCompany(false)}
                      className="text-sm"
                    >
                      ← Select existing company
                    </Button>
                  </div>
                )}
              </div>

              {/* Job Details */}
              <div className="space-y-2">
                <label className="block font-medium">Job Title</label>
                <Input
                  name="title"
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Job Description</label>
                <Editor 
                  value={formData.description}
                  onChange={handleEditorChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-medium">Job Type</label>
                  <Select
                    name="jobType"
                    value={formData.jobType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="part_time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium">Experience Level</label>
                  <Select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-medium">Location</label>
                  <Input
                    name="location"
                    placeholder="e.g. New York or Remote"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium">Remote Type</label>
                  <Select
                    name="remoteType"
                    value={formData.remoteType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, remoteType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select remote type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block font-medium">Min Salary</label>
                  <Input
                    name="salaryMin"
                    type="number"
                    placeholder="e.g. 50000"
                    value={formData.salaryMin}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium">Max Salary</label>
                  <Input
                    name="salaryMax"
                    type="number"
                    placeholder="e.g. 80000"
                    value={formData.salaryMax}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium">Currency</label>
                  <Select
                    name="currency"
                    value={formData.currency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="LKR">LKR (Rs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Application Deadline</label>
                <Input
                  name="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                />
              </div>

              {error && <div className="text-red-500">{error}</div>}

              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/mis/jobs')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Job'}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}