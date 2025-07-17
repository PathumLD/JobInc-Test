// components/mis/jobs/form/SettingsSection.tsx
'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateJobData } from '@/lib/validations/job';

interface SettingsSectionProps {
  form: UseFormReturn<CreateJobData>;
}

export default function SettingsSection({ form }: SettingsSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Publication Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="priority_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority Level</FormLabel>
            <Select 
              onValueChange={(value) => field.onChange(parseInt(value))} 
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Low Priority (1)</span>
                  </div>
                </SelectItem>
                <SelectItem value="2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Normal Priority (2)</span>
                  </div>
                </SelectItem>
                <SelectItem value="3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Medium Priority (3)</span>
                  </div>
                </SelectItem>
                <SelectItem value="4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>High Priority (4)</span>
                  </div>
                </SelectItem>
                <SelectItem value="5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Urgent Priority (5)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}