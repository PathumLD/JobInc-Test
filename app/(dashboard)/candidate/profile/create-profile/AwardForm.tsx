'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { BasicInfoFormValues } from './BasicInfoForm';
import { DatePickerInput } from '@/components/ui/date-picker';

type Award = {
  title: string;
  offered_by: string;
  associated_with?: string;
  date?: string;
  description?: string;
  media_url?: string;
  skill_ids: string[];
};

// Helper function to safely parse date strings
const parseDate = (dateString?: string): Date | undefined => {
  if (!dateString) return undefined;
  
  const date = new Date(dateString);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return undefined;
  }
  return date;
};

// Helper function to format date as ISO string
const formatDateToISO = (date?: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0]; // Return current date in YYYY-MM-DD format
  }
  return date.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
};

export default function AwardsForm({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const { watch, setValue } = useFormContext<BasicInfoFormValues>();
  const [techInputs, setTechInputs] = useState<Record<number, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  
  const awards = watch('awards') as Award[] || [];

  useEffect(() => {
    if (!isInitialized) {
      const currentAwards = watch('awards') as Award[];
      
      if (!currentAwards || currentAwards.length === 0) {
        setValue('awards', [{
          title: '',
          offered_by: '',
          associated_with: '',
          date: formatDateToISO(new Date()),
          description: '',
          media_url: '',
          skill_ids: [],
        }]);
      } else {
        const normalizedAwards = currentAwards.map(award => ({
          title: award.title || '',
          offered_by: award.offered_by || '',
          associated_with: award.associated_with || '',
          date: award.date ? formatDateToISO(parseDate(award.date)) : formatDateToISO(new Date()),
          description: award.description || '',
          media_url: award.media_url || '',
          skill_ids: Array.isArray(award.skill_ids) ? award.skill_ids : [],
        }));
        setValue('awards', normalizedAwards);
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized, setValue, watch]);

  const addNewAward = () => {
    setValue('awards', [
      ...awards,
      {
        title: '',
        offered_by: '',
        associated_with: '',
        date: formatDateToISO(new Date()),
        description: '',
        media_url: '',
        skill_ids: [],
      },
    ]);
  };

  const removeAward = (index: number) => {
    if (awards.length === 1) {
      setValue('awards', [{
        title: '',
        offered_by: '',
        associated_with: '',
        date: formatDateToISO(new Date()),
        description: '',
        media_url: '',
        skill_ids: [],
      }]);
    } else {
      const updatedAwards = [...awards];
      updatedAwards.splice(index, 1);
      setValue('awards', updatedAwards);
    }
  };

  const handleAwardChange = (
    index: number,
    field: keyof Award,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    const updatedAwards = [...awards];
    updatedAwards[index] = {
      ...updatedAwards[index],
      [field]: value
    };
    setValue('awards', updatedAwards);
  };

  const handleTechAdd = (index: number) => {
    const techValue = techInputs[index]?.trim() || '';
    if (!techValue) return;
    
    const updatedAwards = [...awards];
    if (!updatedAwards[index].skill_ids.includes(techValue)) {
      updatedAwards[index].skill_ids = [...updatedAwards[index].skill_ids, techValue];
      setValue('awards', updatedAwards);
    }
    
    setTechInputs({...techInputs, [index]: ''});
  };

  const removeTechSkill = (awardIndex: number, skillIndex: number) => {
    const updatedAwards = [...awards];
    updatedAwards[awardIndex].skill_ids = updatedAwards[awardIndex].skill_ids.filter(
      (_, i) => i !== skillIndex
    );
    setValue('awards', updatedAwards);
  };

  if (!isInitialized) {
    return <div className="flex justify-center items-center h-64">Loading awards...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Awards & Accomplishments</h2>
        <p className="text-muted-foreground">
          Highlight your professional achievements and recognitions.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Awards & Honors</h3>
        
        <div className="space-y-6">
          {awards.map((award, index) => (
            <div key={`award-${index}`} className="space-y-4 p-6 border rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Award #{index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAward(index)}
                  className="text-destructive hover:text-destructive"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`award-title-${index}`}>Award Title *</Label>
                  <Input
                    id={`award-title-${index}`}
                    value={award.title}
                    onChange={(e) =>
                      handleAwardChange(index, 'title', e.target.value)
                    }
                    placeholder="e.g., Employee of the Year"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`award-offered-by-${index}`}>Awarded By *</Label>
                  <Input
                    id={`award-offered-by-${index}`}
                    value={award.offered_by}
                    onChange={(e) =>
                      handleAwardChange(index, 'offered_by', e.target.value)
                    }
                    placeholder="Organization or company name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`award-associated-${index}`}>Associated With</Label>
                  <Input
                    id={`award-associated-${index}`}
                    value={award.associated_with || ''}
                    onChange={(e) =>
                      handleAwardChange(index, 'associated_with', e.target.value)
                    }
                    placeholder="Project, initiative, or department"
                  />
                </div>

                <div>
                  <Label htmlFor={`award-date-${index}`}>Date Received</Label>
                  <DatePickerInput
                    date={parseDate(award.date)}
                    onSelect={(date) => 
                      handleAwardChange(index, 'date', date ? formatDateToISO(date) : formatDateToISO(new Date()))
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`award-description-${index}`}>Description</Label>
                  <Textarea
                    id={`award-description-${index}`}
                    value={award.description || ''}
                    onChange={(e) =>
                      handleAwardChange(index, 'description', e.target.value)
                    }
                    placeholder="Describe the significance of this award"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Skills Demonstrated</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {award.skill_ids.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary">
                        {skill}
                        <button 
                          type="button"
                          onClick={() => removeTechSkill(index, skillIndex)}
                          className="ml-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={techInputs[index] || ''}
                      onChange={(e) => setTechInputs({...techInputs, [index]: e.target.value})}
                      placeholder="Add skill (e.g., Leadership, Innovation)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTechAdd(index);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTechAdd(index)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addNewAward}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Award
          </Button>
        </div>
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