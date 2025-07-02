// app/profile/create-profile/EducationsForm.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { BasicInfoFormValues } from './BasicInfoForm';
import { useEffect } from 'react';

export default function EducationsForm({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const { watch, setValue } = useFormContext<BasicInfoFormValues>();
  
  const educations = watch('education') || [];

  // Initialize with first education entry if empty
  useEffect(() => {
    if (educations.length === 0) {
      setValue('education', [
        {
          degree_diploma: '',
          university_school: '',
          field_of_study: '',
          start_date: '',
          end_date: '',
          grade: '',
        },
      ]);
    }
  }, [educations.length, setValue]);

  const addNewEducation = () => {
    setValue('education', [
      ...educations,
      {
        degree_diploma: '',
        university_school: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        grade: '',
      },
    ]);
  };

  const removeEducation = (index: number) => {
    const updatedEducations = [...educations];
    updatedEducations.splice(index, 1);
    setValue('education', updatedEducations);
  };

  const handleEducationChange = (
    index: number,
    field: keyof typeof educations[0],
    value: string
  ) => {
    const updatedEducations = [...educations];
    updatedEducations[index][field] = value;
    setValue('education', updatedEducations);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Education</h2>
        <p className="text-muted-foreground">
          Add your educational background. Include degrees, diplomas, and certifications.
        </p>
      </div>

      <div className="space-y-8">
        {educations.map((education, index) => (
          <div key={index} className="space-y-4 p-6 border rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Education #{index + 1}</h3>
              {educations.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`degree-${index}`}>Degree/Diploma *</Label>
                <Input
                  id={`degree-${index}`}
                  value={education.degree_diploma}
                  onChange={(e) =>
                    handleEducationChange(index, 'degree_diploma', e.target.value)
                  }
                  placeholder="e.g., Bachelor of Science"
                />
              </div>

              <div>
                <Label htmlFor={`university-${index}`}>Institution *</Label>
                <Input
                  id={`university-${index}`}
                  value={education.university_school}
                  onChange={(e) =>
                    handleEducationChange(index, 'university_school', e.target.value)
                  }
                  placeholder="University or School name"
                />
              </div>

              <div>
                <Label htmlFor={`field-${index}`}>Field of Study</Label>
                <Input
                  id={`field-${index}`}
                  value={education.field_of_study || ''}
                  onChange={(e) =>
                    handleEducationChange(index, 'field_of_study', e.target.value)
                  }
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <Label htmlFor={`grade-${index}`}>Grade/GPA</Label>
                <Input
                  id={`grade-${index}`}
                  value={education.grade || ''}
                  onChange={(e) =>
                    handleEducationChange(index, 'grade', e.target.value)
                  }
                  placeholder="e.g., 3.8 GPA, First Class Honors"
                />
              </div>

              <div>
                <Label htmlFor={`start_date-${index}`}>Start Date</Label>
                <Input
                  id={`start_date-${index}`}
                  type="date"
                  value={education.start_date}
                  onChange={(e) =>
                    handleEducationChange(index, 'start_date', e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor={`end_date-${index}`}>End Date (or expected)</Label>
                <Input
                  id={`end_date-${index}`}
                  type="date"
                  value={education.end_date || ''}
                  onChange={(e) =>
                    handleEducationChange(index, 'end_date', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        {/* Only show Add button after first education entry is displayed */}
        {educations.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={addNewEducation}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Education
          </Button>
        )}
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