// components/mis/jobs/form/ContentSection.tsx
'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CreateJobData } from '@/lib/validations/job';

interface ContentSectionProps {
  form: UseFormReturn<CreateJobData>;
}

export default function ContentSection({ form }: ContentSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Requirements</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="List the key requirements for this position..."
                rows={4}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="responsibilities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Responsibilities</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the key responsibilities and duties..."
                rows={4}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="benefits"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Benefits</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="List the benefits and perks offered..."
                rows={4}
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