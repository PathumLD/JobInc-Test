// components/mis/jobs/form/CompanyInfoSection.tsx
'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CreateJobData } from '@/lib/validations/job';

interface CompanyInfoSectionProps {
  form: UseFormReturn<CreateJobData>;
}

export default function CompanyInfoSection({ form }: CompanyInfoSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="customCompanyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name *</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. TechCorp Inc." 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customCompanyEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Email</FormLabel>
            <FormControl>
              <Input 
                type="email"
                placeholder="e.g. jobs@techcorp.com" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customCompanyPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Phone</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. +1 (555) 123-4567" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customCompanyWebsite"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Website</FormLabel>
            <FormControl>
              <Input 
                type="url"
                placeholder="e.g. https://techcorp.com" 
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