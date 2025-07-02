// app/profile/create-profile/ProjectsForm.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { BasicInfoFormValues } from './BasicInfoForm';

export default function ProjectsForm({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const { watch, setValue } = useFormContext<BasicInfoFormValues>();
  const [techInputs, setTechInputs] = useState<Record<number, string>>({});
  const [toolInputs, setToolInputs] = useState<Record<number, string>>({});
  const [methodologyInputs, setMethodologyInputs] = useState<Record<number, string>>({});
  const [responsibilityInputs, setResponsibilityInputs] = useState<Record<number, string>>({});
  const [skillInputs, setSkillInputs] = useState<Record<number, string>>({});
  const [mediaInputs, setMediaInputs] = useState<Record<number, string>>({});
  
  const projects = watch('projects') || [];

  // Initialize with first project if none exist
  useEffect(() => {
    if (projects.length === 0) {
      setValue('projects', [
        {
          name: '',
          description: '',
          start_date: '',
          end_date: '',
          is_current: false,
          role: '',
          responsibilities: [],
          technologies: [],
          tools: [],
          methodologies: [],
          is_confidential: false,
          can_share_details: false,
          url: '',
          repository_url: '',
          media_urls: [],
          skills_gained: [],
        },
      ]);
    }
  }, [projects.length, setValue]);

  // Check if first project has minimum required fields filled
  const isFirstProjectMinimallyFilled = () => {
    if (projects.length === 0) return false;
    const firstProject = projects[0];
    return firstProject.name && firstProject.description && firstProject.start_date;
  };

  const addNewProject = () => {
    setValue('projects', [
      ...projects,
      {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_current: false,
        role: '',
        responsibilities: [],
        technologies: [],
        tools: [],
        methodologies: [],
        is_confidential: false,
        can_share_details: false,
        url: '',
        repository_url: '',
        media_urls: [],
        skills_gained: [],
      },
    ]);
  };

  const removeProject = (index: number) => {
    // Prevent removing the last project (always keep at least one)
    if (projects.length <= 1) return;
    
    const updatedProjects = [...projects];
    updatedProjects.splice(index, 1);
    setValue('projects', updatedProjects);
  };

  const handleProjectChange = (
    index: number,
    field: keyof typeof projects[0],
    value: any
  ) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setValue('projects', updatedProjects);
  };

  const handleArrayAdd = (
    index: number,
    arrayField: 'technologies' | 'tools' | 'methodologies' | 'responsibilities' | 'skills_gained' | 'media_urls',
    inputValue: string,
    inputState: Record<number, string>,
    setInputState: React.Dispatch<React.SetStateAction<Record<number, string>>>
  ) => {
    if (!inputValue.trim()) return;
    
    const updatedProjects = [...projects];
    if (!updatedProjects[index][arrayField]) {
      updatedProjects[index][arrayField] = [];
    }
    
    if (!updatedProjects[index][arrayField].includes(inputValue.trim())) {
      updatedProjects[index][arrayField].push(inputValue.trim());
      setValue('projects', updatedProjects);
    }
    
    setInputState({...inputState, [index]: ''});
  };

  const handleArrayRemove = (
    projectIndex: number,
    arrayField: 'technologies' | 'tools' | 'methodologies' | 'responsibilities' | 'skills_gained' | 'media_urls',
    itemIndex: number
  ) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex][arrayField].splice(itemIndex, 1);
    setValue('projects', updatedProjects);
  };

  const handleArrayInputKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    arrayField: 'technologies' | 'tools' | 'methodologies' | 'responsibilities' | 'skills_gained' | 'media_urls',
    inputValue: string,
    inputState: Record<number, string>,
    setInputState: React.Dispatch<React.SetStateAction<Record<number, string>>>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleArrayAdd(index, arrayField, inputValue, inputState, setInputState);
      }
    }
  };

  const renderArrayInput = (
    index: number,
    arrayField: 'technologies' | 'tools' | 'methodologies' | 'responsibilities' | 'skills_gained' | 'media_urls',
    label: string,
    placeholder: string,
    inputState: Record<number, string>,
    setInputState: React.Dispatch<React.SetStateAction<Record<number, string>>>
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {projects[index][arrayField]?.map((item: string, itemIndex: number) => (
          <Badge 
            key={itemIndex} 
            variant="secondary"
            className="flex items-center gap-1"
          >
            {item}
            <button 
              type="button"
              onClick={() => handleArrayRemove(index, arrayField, itemIndex)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputState[index] || ''}
          onChange={(e) => setInputState({...inputState, [index]: e.target.value})}
          placeholder={placeholder}
          onKeyDown={(e) => handleArrayInputKeyDown(e, index, arrayField, inputState[index] || '', inputState, setInputState)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => handleArrayAdd(index, arrayField, inputState[index] || '', inputState, setInputState)}
        >
          Add
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Projects</h2>
        <p className="text-muted-foreground">
          Showcase your personal, academic, or professional projects.
        </p>
      </div>

      <div className="space-y-8">
        {projects.map((project, index) => (
          <div key={index} className="space-y-4 p-6 border rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Project #{index + 1}</h3>
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor={`name-${index}`}>Project Name *</Label>
                <Input
                  id={`name-${index}`}
                  value={project.name}
                  onChange={(e) =>
                    handleProjectChange(index, 'name', e.target.value)
                  }
                  placeholder="e.g., E-commerce Website"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor={`description-${index}`}>Description *</Label>
                <Textarea
                  id={`description-${index}`}
                  value={project.description}
                  onChange={(e) =>
                    handleProjectChange(index, 'description', e.target.value)
                  }
                  placeholder="Describe the project, your role, and key achievements"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor={`role-${index}`}>Your Role</Label>
                <Input
                  id={`role-${index}`}
                  value={project.role || ''}
                  onChange={(e) =>
                    handleProjectChange(index, 'role', e.target.value)
                  }
                  placeholder="e.g., Frontend Developer, Project Lead"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id={`is_current-${index}`}
                  checked={project.is_current || false}
                  onCheckedChange={(checked) =>
                    handleProjectChange(index, 'is_current', checked)
                  }
                />
                <Label htmlFor={`is_current-${index}`}>Currently working on this project</Label>
              </div>

              <div>
                <Label htmlFor={`start_date-${index}`}>Start Date *</Label>
                <Input
                  id={`start_date-${index}`}
                  type="date"
                  value={project.start_date}
                  onChange={(e) =>
                    handleProjectChange(index, 'start_date', e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor={`end_date-${index}`}>End Date</Label>
                <Input
                  id={`end_date-${index}`}
                  type="date"
                  value={project.end_date || ''}
                  onChange={(e) =>
                    handleProjectChange(index, 'end_date', e.target.value)
                  }
                  disabled={project.is_current}
                />
              </div>

              <div>
                <Label htmlFor={`url-${index}`}>Project URL</Label>
                <Input
                  id={`url-${index}`}
                  type="url"
                  value={project.url || ''}
                  onChange={(e) =>
                    handleProjectChange(index, 'url', e.target.value)
                  }
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor={`repository_url-${index}`}>Repository URL</Label>
                <Input
                  id={`repository_url-${index}`}
                  type="url"
                  value={project.repository_url || ''}
                  onChange={(e) =>
                    handleProjectChange(index, 'repository_url', e.target.value)
                  }
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="md:col-span-2">
                {renderArrayInput(
                  index,
                  'responsibilities',
                  'Key Responsibilities',
                  'Add responsibility (e.g., Developed user interface)',
                  responsibilityInputs,
                  setResponsibilityInputs
                )}
              </div>

              <div className="md:col-span-2">
                {renderArrayInput(
                  index,
                  'technologies',
                  'Technologies Used',
                  'Add technology (e.g., React, Node.js)',
                  techInputs,
                  setTechInputs
                )}
              </div>

              <div className="md:col-span-2">
                {renderArrayInput(
                  index,
                  'tools',
                  'Tools Used',
                  'Add tool (e.g., VS Code, Docker)',
                  toolInputs,
                  setToolInputs
                )}
              </div>

              <div className="md:col-span-2">
                {renderArrayInput(
                  index,
                  'methodologies',
                  'Methodologies',
                  'Add methodology (e.g., Agile, Scrum)',
                  methodologyInputs,
                  setMethodologyInputs
                )}
              </div>

              <div className="md:col-span-2">
                {renderArrayInput(
                  index,
                  'skills_gained',
                  'Skills Gained',
                  'Add skill gained (e.g., React Development, API Integration)',
                  skillInputs,
                  setSkillInputs
                )}
              </div>

              <div className="md:col-span-2">
                {renderArrayInput(
                  index,
                  'media_urls',
                  'Media URLs (Screenshots, Videos)',
                  'Add media URL (e.g., https://example.com/screenshot.png)',
                  mediaInputs,
                  setMediaInputs
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`can_share_details-${index}`}
                  checked={project.can_share_details || false}
                  onCheckedChange={(checked) =>
                    handleProjectChange(index, 'can_share_details', checked)
                  }
                />
                <Label htmlFor={`can_share_details-${index}`}>Can share project details publicly</Label>
              </div>
            </div>
          </div>
        ))}

        {/* Only show Add button if first project is filled with minimum required fields */}
          <Button
            type="button"
            variant="outline"
            onClick={addNewProject}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Project
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