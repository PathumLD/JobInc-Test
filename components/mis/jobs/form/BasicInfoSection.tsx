// components/mis/jobs/form/BasicInfoSection.tsx
'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreateJobData } from '@/lib/validations/job';

interface BasicInfoSectionProps {
  form: UseFormReturn<CreateJobData>;
}

export default function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Title *</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. Senior Software Engineer" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Description *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the job role, company, and what makes this opportunity unique..."
                rows={6}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. San Francisco, CA" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}



