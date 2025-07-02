// app/profile/create-profile/AwardsForm.tsx
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
  
  const awards = watch('awards') || [];

  // Initialize with proper data handling - FIXED
  useEffect(() => {
    if (!isInitialized) {
      const currentAwards = watch('awards');
      console.log('Current awards in form:', currentAwards); // Debug log
      
      // Only initialize empty array if no data exists from CV extraction
      if (!currentAwards || currentAwards.length === 0) {
        console.log('Initializing empty awards array');
        setValue('awards', [
          {
            title: '',
            associated_with: '',
            offered_by: '',
            date: new Date().toISOString(),
            description: '',
            media_url: '',
            skill_ids: [],
          },
        ]);
      } else {
        console.log('Awards data already exists from CV extraction:', currentAwards);
        // Ensure all awards have required fields with proper defaults
        const normalizedAwards = currentAwards.map((award) => ({
          title: award.title || '',
          associated_with: award.associated_with || '',
          offered_by: award.offered_by || '',
          date: award.date || new Date().toISOString(),
          description: award.description || '',
          media_url: award.media_url || '',
          skill_ids: award.skill_ids || [],
        }));
        setValue('awards', normalizedAwards);
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized, setValue, watch]);

  // Awards functions
  const addNewAward = () => {
    setValue('awards', [
      ...awards,
      {
        title: '',
        associated_with: '',
        offered_by: '',
        date: new Date().toISOString(),
        description: '',
        media_url: '',
        skill_ids: [],
      },
    ]);
  };

  const removeAward = (index: number) => {
    if (awards.length === 1) {
      // Don't allow removing the last award, just reset it
      setValue('awards', [{
        title: '',
        associated_with: '',
        offered_by: '',
        date: new Date().toISOString(),
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
    field: keyof typeof awards[0],
    value: any
  ) => {
    const updatedAwards = [...awards];
    updatedAwards[index] = {
      ...updatedAwards[index],
      [field]: value
    };
    setValue('awards', updatedAwards);
    console.log(`Updated award ${index} field ${field}:`, value); // Debug log
  };

  // Tech/Skills functions - FIXED
  const handleTechAdd = (index: number) => {
    const techValue = techInputs[index] || '';
    if (!techValue.trim()) return;
    
    const updatedAwards = [...awards];
    if (!updatedAwards[index].skill_ids) {
      updatedAwards[index].skill_ids = [];
    }
    
    if (!updatedAwards[index].skill_ids.includes(techValue.trim())) {
      updatedAwards[index].skill_ids.push(techValue.trim());
      setValue('awards', updatedAwards);
    }
    
    setTechInputs({...techInputs, [index]: ''});
  };

  const removeTechSkill = (awardIndex: number, skillIndex: number) => {
    const updatedAwards = [...awards];
    if (updatedAwards[awardIndex].skill_ids) {
      updatedAwards[awardIndex].skill_ids.splice(skillIndex, 1);
      setValue('awards', updatedAwards);
    }
  };

  // Debug log for rendering
  console.log('Rendering awards:', awards);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Awards & Accomplishments</h2>
        <p className="text-muted-foreground">
          Highlight your professional achievements and recognitions.
        </p>
      </div>

      {/* Awards Section */}
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
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`award-title-${index}`}>Award Title *</Label>
                  <Input
                    id={`award-title-${index}`}
                    value={award.title || ''}
                    onChange={(e) =>
                      handleAwardChange(index, 'title', e.target.value)
                    }
                    placeholder="e.g., Employee of the Year"
                  />
                </div>

                <div>
                  <Label htmlFor={`award-offered-by-${index}`}>Awarded By *</Label>
                  <Input
                    id={`award-offered-by-${index}`}
                    value={award.offered_by || ''}
                    onChange={(e) =>
                      handleAwardChange(index, 'offered_by', e.target.value)
                    }
                    placeholder="Organization or company name"
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
                    date={award.date ? new Date(award.date) : undefined}
                    onSelect={(date) => 
                      handleAwardChange(index, 'date', date?.toISOString())
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
                    {award.skill_ids?.map((skill, skillIndex) => (
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

          {/* Always show "Add Another Award" button */}
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