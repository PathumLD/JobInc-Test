// components/mis/jobs/form/JobDetailsSection.tsx
'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateJobData } from '@/lib/validations/job';

interface JobDetailsSectionProps {
  form: UseFormReturn<CreateJobData>;
}

export default function JobDetailsSection({ form }: JobDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="job_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entry_level">Entry Level</SelectItem>
                  <SelectItem value="mid_level">Mid Level</SelectItem>
                  <SelectItem value="senior_level">Senior Level</SelectItem>
                  <SelectItem value="executive_level">Executive Level</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="remote_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Work Type *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="onsite">On-site</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="application_deadline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Deadline</FormLabel>
            <FormControl>
              <Input 
                type="date"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-center space-x-6">
        <FormField
          control={form.control}
          name="equity_offered"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Equity Offered</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ai_skills_required"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>AI Skills Required</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}