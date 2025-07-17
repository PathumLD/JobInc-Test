// components/mis/jobs/form/SalarySection.tsx
'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateJobData } from '@/lib/validations/job';

interface SalarySectionProps {
  form: UseFormReturn<CreateJobData>;
}

export default function SalarySection({ form }: SalarySectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="salary_min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Salary</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="e.g. 80000"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary_max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Salary</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="e.g. 120000"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="LKR">LKR</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salary type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}





