// components/mis/jobs/form/SkillsSection.tsx
'use client';

import { useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { CreateJobData } from '@/lib/validations/job';

interface SkillsSectionProps {
  form: UseFormReturn<CreateJobData>;
}

export default function SkillsSection({ form }: SkillsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'skills'
  });

  const addSkill = () => {
    append({
      skill_name: '',
      required_level: 'required',
      proficiency_level: 'intermediate',
      years_required: undefined,
      weight: 1.0
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Skills & Requirements</h3>
        <Button type="button" variant="outline" size="sm" onClick={addSkill}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Skill {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`skills.${index}.skill_name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. JavaScript, React, Python"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`skills.${index}.years_required`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years Required</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="e.g. 3"
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
                name={`skills.${index}.required_level`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="nice_to_have">Nice to Have</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`skills.${index}.proficiency_level`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proficiency Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proficiency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No skills added yet</p>
          <Button type="button" variant="outline" onClick={addSkill} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Skill
          </Button>
        </div>
      )}
    </div>
  );
}