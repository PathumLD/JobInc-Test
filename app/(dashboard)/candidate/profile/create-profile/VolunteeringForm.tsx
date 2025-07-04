// app/profile/create-profile/VolunteeringForm.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { useState, useEffect } from 'react';
import { BasicInfoFormValues } from './BasicInfoForm';
import { DatePickerInput } from '@/components/ui/date-picker';

export default function VolunteeringForm({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const { watch, setValue, getValues } = useFormContext<BasicInfoFormValues>();
  
  const volunteering = watch('volunteering') || [];

  //  CRITICAL FIX: Only initialize if truly empty and no meaningful data
  useEffect(() => {
    console.log(' VolunteeringForm useEffect triggered');
    console.log(' Current volunteering length:', volunteering.length);
    console.log(' Current volunteering data:', volunteering);
    
    // Check if we have any meaningful data (extracted or manually entered)
    const hasMeaningfulData = volunteering.some(v => 
      (v.role && v.role.trim() !== '') || 
      (v.institution && v.institution.trim() !== '') ||
      (v.description && v.description.trim() !== '')
    );
    
    console.log(' Has meaningful data?', hasMeaningfulData);
    
    // Only initialize with empty entry if:
    // 1. No volunteering entries exist, OR
    // 2. No meaningful data exists in any entry
    if (volunteering.length === 0 || !hasMeaningfulData) {
      // But first check if this is just extracted empty data
      if (volunteering.length === 0) {
        console.log(' Initializing with default empty entry');
        setValue('volunteering', [
          {
            role: '',
            institution: '',
            cause: '',
            start_date: new Date().toISOString(),
            end_date: '',
            is_current: false,
            description: '',
            media_url: '',
          },
        ]);
      }
    } else {
      console.log(' Keeping existing meaningful data');
    }
  }, []); // Remove volunteering.length dependency to prevent re-initialization

  const addNewVolunteering = () => {
    console.log(' Adding new volunteering entry');
    setValue('volunteering', [
      ...volunteering,
      {
        role: '',
        institution: '',
        cause: '',
        start_date: new Date().toISOString(),
        end_date: '',
        is_current: false,
        description: '',
        media_url: '',
      },
    ]);
  };

  const removeVolunteering = (index: number) => {
    console.log(' Removing volunteering entry at index:', index);
    // Prevent removing if it's the last/only entry
    if (volunteering.length <= 1) return;
    
    const updatedVolunteering = [...volunteering];
    updatedVolunteering.splice(index, 1);
    setValue('volunteering', updatedVolunteering);
  };

  const handleVolunteeringChange = (
    index: number,
    field: keyof typeof volunteering[0],
    value: any
  ) => {
    console.log(` Updating volunteering[${index}].${field} =`, value);
    const updatedVolunteering = [...volunteering];
    updatedVolunteering[index][field] = value;
    
    // Handle is_current logic
    if (field === 'is_current' && value === true) {
      updatedVolunteering[index].end_date = '';
    }
    
    setValue('volunteering', updatedVolunteering);
    console.log(' Updated volunteering:', updatedVolunteering);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Volunteering Experience</h2>
            <p className="text-muted-foreground">
              Share your volunteer work and community involvement.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {volunteering.map((volunteer, index) => (
          <div key={index} className="space-y-4 p-6 border rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">
                {index === 0 ? 'Volunteering Experience' : `Volunteering Experience #${index + 1}`}
              </h3>
              {volunteering.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVolunteering(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`role-${index}`}>Role *</Label>
                <Input
                  id={`role-${index}`}
                  value={volunteer.role || ''}
                  onChange={(e) =>
                    handleVolunteeringChange(index, 'role', e.target.value)
                  }
                  placeholder="e.g., Volunteer Coordinator"
                />
              </div>

              <div>
                <Label htmlFor={`institution-${index}`}>Organization *</Label>
                <Input
                  id={`institution-${index}`}
                  value={volunteer.institution || ''}
                  onChange={(e) =>
                    handleVolunteeringChange(index, 'institution', e.target.value)
                  }
                  placeholder="Name of the organization"
                />
              </div>

              <div>
                <Label htmlFor={`cause-${index}`}>Cause/Area</Label>
                <Input
                  id={`cause-${index}`}
                  value={volunteer.cause || ''}
                  onChange={(e) =>
                    handleVolunteeringChange(index, 'cause', e.target.value)
                  }
                  placeholder="e.g., Education, Environment"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor={`start_date-${index}`}>Start Date</Label>
                  <DatePickerInput
                    date={volunteer.start_date ? new Date(volunteer.start_date) : undefined}
                    onSelect={(date) => 
                      handleVolunteeringChange(index, 'start_date', date?.toISOString())
                    }
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor={`end_date-${index}`}>End Date</Label>
                  <DatePickerInput
                    date={volunteer.end_date ? new Date(volunteer.end_date) : undefined}
                    onSelect={(date) => 
                      handleVolunteeringChange(index, 'end_date', date?.toISOString())
                    }
                    disabled={volunteer.is_current}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`is_current-${index}`}
                  checked={volunteer.is_current || false}
                  onChange={(e) =>
                    handleVolunteeringChange(index, 'is_current', e.target.checked)
                  }
                  className="mr-2"
                />
                <Label htmlFor={`is_current-${index}`}>I currently volunteer here</Label>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={volunteer.description || ''}
                  onChange={(e) =>
                    handleVolunteeringChange(index, 'description', e.target.value)
                  }
                  placeholder="Describe your responsibilities and achievements"
                  rows={4}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Always show the Add button */}
        <Button
          type="button"
          variant="outline"
          onClick={addNewVolunteering}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Volunteering Experience
        </Button>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}