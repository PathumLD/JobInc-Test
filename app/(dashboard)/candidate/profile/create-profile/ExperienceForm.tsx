// app/profile/create-profile/WorkExperiencesForm.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2, X } from 'lucide-react';
import { BasicInfoFormValues } from './BasicInfoForm';
import { useEffect, useState } from 'react';
import { WorkExperience } from '@prisma/client';

// Updated interfaces for proper linking
interface AccomplishmentFormData {
  title: string;
  description: string;
  temp_work_experience_index?: number; // For frontend relationship tracking
  work_experience_id?: string | null; // Will be set after DB save
  resume_id?: string | null; // For linking to resume if needed
}

interface SkillFormData {
  skill_name: string;
  skill_source?: string;
  proficiency?: number;
}

export default function WorkExperiencesForm({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const { watch, setValue } = useFormContext<BasicInfoFormValues>();
  
  const workExperiences = watch('work_experience' as keyof BasicInfoFormValues) || [];
  const accomplishments = watch('accomplishments' as keyof BasicInfoFormValues) || [];
  const candidateSkills = watch('candidate_skills' as keyof BasicInfoFormValues) || [];
  
  const [mediaFiles, setMediaFiles] = useState<{[key: string]: File | null}>({});
  const [skillInput, setSkillInput] = useState<{[key: string]: string}>({});

  // Initialize with one empty experience if none exist
  useEffect(() => {
    if (Array.isArray(workExperiences) && workExperiences.length === 0) {
      setValue('work_experience' as keyof BasicInfoFormValues, [{
        title: '',
        company: '',
        employment_type: 'full_time',
        is_current: false,
        start_date: '',
        end_date: '',
        location: '',
        description: '',
        job_source: '',
        skill_ids: [],
        media_url: '',
      }]);
    }
  }, [workExperiences.length, setValue]);

  const addNewExperience = () => {
    setValue('work_experience' as keyof BasicInfoFormValues, [
      ...(workExperiences as WorkExperience[]),
      {
        title: '',
        company: '',
        employment_type: 'full_time',
        is_current: false,
        start_date: '',
        end_date: '',
        location: '',
        description: '',
        job_source: '',
        skill_ids: [],
        media_url: '',
      },
    ]);
  };

  const removeExperience = (index: number) => {
    const updatedExperiences = [...workExperiences];
    updatedExperiences.splice(index, 1);
    setValue('work_experience', updatedExperiences);
    
    // Remove associated accomplishments and update indexes
    const updatedAccomplishments = accomplishments
      .filter((acc: AccomplishmentFormData) => acc.temp_work_experience_index !== index)
      .map((acc: AccomplishmentFormData) => ({
        ...acc,
        // Update indexes for accomplishments of experiences that come after the removed one
        temp_work_experience_index: 
          acc.temp_work_experience_index !== undefined && acc.temp_work_experience_index > index
            ? acc.temp_work_experience_index - 1
            : acc.temp_work_experience_index
      }));
    setValue('accomplishments', updatedAccomplishments);
    
    // Remove associated media file
    const newMediaFiles = { ...mediaFiles };
    delete newMediaFiles[`experience-${index}`];
    setMediaFiles(newMediaFiles);
  };

  const handleExperienceChange = (
    index: number,
    field: keyof typeof workExperiences[0],
    value: any
  ) => {
    const updatedExperiences = [...workExperiences];
    updatedExperiences[index][field] = value;
    setValue('work_experience', updatedExperiences);
  };

  // Updated accomplishments functions
  const addNewAccomplishment = (experienceIndex: number) => {
  const newAccomplishment: AccomplishmentFormData = {
    title: '',
    description: '',
    temp_work_experience_index: experienceIndex, // This will be mapped to work_experience_id in backend
    work_experience_id: null, // Will be set by backend
    resume_id: null,
  };
  
  setValue('accomplishments', [...accomplishments, newAccomplishment]);
  };

  const removeAccomplishment = (accomplishmentIndex: number) => {
    const updatedAccomplishments = [...accomplishments];
    updatedAccomplishments.splice(accomplishmentIndex, 1);
    setValue('accomplishments', updatedAccomplishments);
  };

  const handleAccomplishmentChange = (
    accomplishmentIndex: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const updatedAccomplishments = [...accomplishments];
    updatedAccomplishments[accomplishmentIndex][field] = value;
    setValue('accomplishments', updatedAccomplishments);
  };

  // Skills functions
  const addSkill = (experienceIndex: number) => {
    const skillName = skillInput[`experience-${experienceIndex}`]?.trim();
    if (!skillName) return;

    const newSkill: SkillFormData = {
      skill_name: skillName,
      skill_source: `work_experience_${experienceIndex}`,
      proficiency: 0,
    };

    setValue('candidate_skills', [...candidateSkills, newSkill]);
    
    // Add skill ID to work experience
    const updatedExperiences = [...workExperiences];
    const currentSkillIds = updatedExperiences[experienceIndex].skill_ids || [];
    updatedExperiences[experienceIndex].skill_ids = [...currentSkillIds, skillName]; // Temporary ID
    setValue('work_experience', updatedExperiences);
    
    // Clear input
    setSkillInput(prev => ({ ...prev, [`experience-${experienceIndex}`]: '' }));
  };

  const removeSkill = (experienceIndex: number, skillName: string) => {
    // Remove from candidate_skills
    const updatedSkills = candidateSkills.filter(
      skill => !(skill.skill_name === skillName && skill.skill_source === `work_experience_${experienceIndex}`)
    );
    setValue('candidate_skills', updatedSkills);
    
    // Remove from work experience
    const updatedExperiences = [...workExperiences];
    updatedExperiences[experienceIndex].skill_ids = 
      updatedExperiences[experienceIndex].skill_ids.filter(id => id !== skillName);
    setValue('work_experience', updatedExperiences);
  };

  // Handle file upload
  const handleFileUpload = (experienceIndex: number, file: File | null) => {
    setMediaFiles(prev => ({
      ...prev,
      [`experience-${experienceIndex}`]: file
    }));
    
    if (file) {
      handleExperienceChange(experienceIndex, 'media_url', file.name);
    } else {
      handleExperienceChange(experienceIndex, 'media_url', '');
    }
  };

  // Get accomplishments for a specific experience
  const getExperienceAccomplishments = (experienceIndex: number) => {
    return accomplishments
      .map((acc: AccomplishmentFormData, index: number) => ({ ...acc, originalIndex: index }))
      .filter(acc => acc.temp_work_experience_index === experienceIndex);
  };

  // Get skills for a specific experience
  const getExperienceSkills = (experienceIndex: number) => {
    return candidateSkills.filter(
      skill => skill.skill_source === `work_experience_${experienceIndex}`
    );
  };

  return (
    <div className="space-y-8">
      {/* Work Experiences Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Work Experiences</h2>
          <p className="text-muted-foreground">
            Add your professional work history. Start with your most recent position.
          </p>
        </div>

        <div className="space-y-6">
          {workExperiences.map((experience, index) => (
            <div key={index} className="space-y-6 p-6 border rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Experience #{index + 1}</h3>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              {/* Basic Experience Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`title-${index}`}>Job Title *</Label>
                  <Input
                    id={`title-${index}`}
                    value={experience.title}
                    onChange={(e) =>
                      handleExperienceChange(index, 'title', e.target.value)
                    }
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div>
                  <Label htmlFor={`company-${index}`}>Company *</Label>
                  <Input
                    id={`company-${index}`}
                    value={experience.company}
                    onChange={(e) =>
                      handleExperienceChange(index, 'company', e.target.value)
                    }
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <Label htmlFor={`employment_type-${index}`}>Employment Type</Label>
                  <select
                    id={`employment_type-${index}`}
                    value={experience.employment_type}
                    onChange={(e) =>
                      handleExperienceChange(index, 'employment_type', e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor={`location-${index}`}>Location</Label>
                  <Input
                    id={`location-${index}`}
                    value={experience.location || ''}
                    onChange={(e) =>
                      handleExperienceChange(index, 'location', e.target.value)
                    }
                    placeholder="e.g., Remote, New York, NY"
                  />
                </div>

                <div>
                  <Label htmlFor={`start_date-${index}`}>Start Date *</Label>
                  <Input
                    id={`start_date-${index}`}
                    type="date"
                    value={experience.start_date}
                    onChange={(e) =>
                      handleExperienceChange(index, 'start_date', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`end_date-${index}`}>End Date</Label>
                  <Input
                    id={`end_date-${index}`}
                    type="date"
                    value={experience.end_date || ''}
                    onChange={(e) =>
                      handleExperienceChange(index, 'end_date', e.target.value)
                    }
                    disabled={experience.is_current}
                  />
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id={`is_current-${index}`}
                      checked={experience.is_current}
                      onChange={(e) => {
                        handleExperienceChange(index, 'is_current', e.target.checked);
                        if (e.target.checked) {
                          handleExperienceChange(index, 'end_date', '');
                        }
                      }}
                      className="mr-2"
                    />
                    <Label htmlFor={`is_current-${index}`}>I currently work here</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`job_source-${index}`}>Job Source</Label>
                  <Input
                    id={`job_source-${index}`}
                    value={experience.job_source || ''}
                    onChange={(e) =>
                      handleExperienceChange(index, 'job_source', e.target.value)
                    }
                    placeholder="e.g., LinkedIn, Company Website, Referral"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={experience.description || ''}
                    onChange={(e) =>
                      handleExperienceChange(index, 'description', e.target.value)
                    }
                    placeholder="Describe your responsibilities and achievements"
                    rows={4}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`media-${index}`}>Supporting Media (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id={`media-${index}`}
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(index, e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {mediaFiles[`experience-${index}`] && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileUpload(index, null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload certificates, project screenshots, or other relevant media
                  </p>
                </div>
              </div>

              {/* Skills Section for this Experience */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Skills Used</h4>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {getExperienceSkills(index).map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{skill.skill_name}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index, skill.skill_name)}
                        className="hover:bg-blue-200 rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., JavaScript, React)"
                    value={skillInput[`experience-${index}`] || ''}
                    onChange={(e) =>
                      setSkillInput(prev => ({
                        ...prev,
                        [`experience-${index}`]: e.target.value
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(index);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addSkill(index)}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Accomplishments Section for this Experience */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    Accomplishments for "{workExperiences[index]?.title || 'This Position'}"
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNewAccomplishment(index)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Accomplishment
                  </Button>
                </div>
                
                {getExperienceAccomplishments(index).length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No accomplishments added yet. Click `Add Accomplishment` to highlight your achievements in this role.
                  </p>
                )}

                {getExperienceAccomplishments(index).length > 0 && (
                  <div className="space-y-4">
                    {getExperienceAccomplishments(index).map((accomplishment, accomplishmentIndex) => (
                      <div key={accomplishment.originalIndex} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-sm">Accomplishment #{accomplishmentIndex + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAccomplishment(accomplishment.originalIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor={`accomplishment-title-${accomplishment.originalIndex}`}>
                              Title *
                            </Label>
                            <Input
                              id={`accomplishment-title-${accomplishment.originalIndex}`}
                              value={accomplishment.title}
                              onChange={(e) =>
                                handleAccomplishmentChange(accomplishment.originalIndex, 'title', e.target.value)
                              }
                              placeholder="e.g., Led successful product launch"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`accomplishment-description-${accomplishment.originalIndex}`}>
                              Description *
                            </Label>
                            <Textarea
                              id={`accomplishment-description-${accomplishment.originalIndex}`}
                              value={accomplishment.description}
                              onChange={(e) =>
                                handleAccomplishmentChange(accomplishment.originalIndex, 'description', e.target.value)
                              }
                              placeholder="Describe the accomplishment and its impact"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addNewExperience}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Experience
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