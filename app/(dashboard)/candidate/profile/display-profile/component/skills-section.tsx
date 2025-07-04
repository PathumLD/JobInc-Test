// app/(dashboard)/candidate/profile/display-profile/components/skills-section.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SectionWrapper from '@/components/candidate/profile/section-wrapper';
import EmptySection from '@/components/candidate/profile/empty-section';
import SkillTag from '@/components/candidate/profile/skill-tag';
import { SkillDisplayData } from '@/lib/types/profile-display';
import { 
  groupSkillsByCategory, 
  sortSkillsByProficiency 
} from '@/lib/utils/profile-formatters';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface SkillsSectionProps {
  skills: SkillDisplayData[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const hasSkills = skills && skills.length > 0;

  if (!hasSkills) {
    return (
      <SectionWrapper 
        title="Skills"
        editHref="/candidate/profile/edit/skills"
        isEmpty={true}
      >
        <EmptySection
          title="Showcase your skills"
          description="Add skills to highlight your expertise and help employers find you for relevant opportunities."
          addHref="/candidate/profile/edit/skills"
          buttonText="Add skills"
          icon={Zap}
        />
      </SectionWrapper>
    );
  }

  // Group and sort skills
  const groupedSkills = groupSkillsByCategory(skills);
  const sortedCategories = Object.keys(groupedSkills).sort();
  
  // Limit display unless expanded
  const visibleSkills = isExpanded ? skills : skills.slice(0, 12);
  const hasMoreSkills = skills.length > 12;

  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <SectionWrapper 
      title="Skills"
      editHref="/candidate/profile/edit/skills"
      sectionId="skills"
    >
      <div className="space-y-6">
        {/* Skills by Category */}
        {sortedCategories.map((category) => {
          const categorySkills = sortSkillsByProficiency(groupedSkills[category]);
          const isExpanded = expandedCategories.has(category);
          const displaySkills = isExpanded ? categorySkills : categorySkills.slice(0, 8);
          const hasMoreInCategory = categorySkills.length > 8;

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 capitalize">
                  {category === 'other' ? 'Other Skills' : category} 
                  <span className="ml-2 text-xs text-gray-500">
                    ({categorySkills.length})
                  </span>
                </h3>
                
                {hasMoreInCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCategoryExpansion(category)}
                    className="text-xs text-blue-600 hover:text-blue-700 h-auto p-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show all {categorySkills.length}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Skills Grid */}
              <div className="flex flex-wrap gap-2">
                {displaySkills.map((skill) => (
                  <SkillTag 
                    key={skill.id} 
                    skill={skill}
                    showProficiency={true}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Show All Skills Toggle */}
        {hasMoreSkills && (
          <div className="text-center pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show fewer skills
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show all {skills.length} skills
                </>
              )}
            </Button>
          </div>
        )}

        {/* Skills Summary */}
        <div className="text-xs text-gray-500 border-t pt-3 mt-4">
          <div className="flex justify-between items-center">
            <span>{skills.length} total skills</span>
            <span>
              {sortedCategories.length} categories
            </span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}