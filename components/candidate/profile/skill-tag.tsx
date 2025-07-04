// components/candidate/profile/skill-tag.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { SkillDisplayData } from '@/lib/types/profile-display';
import { 
  formatSkillProficiency, 
  getProficiencyLevel 
} from '@/lib/utils/profile-formatters';

interface SkillTagProps {
  skill: SkillDisplayData;
  showProficiency?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
}

export default function SkillTag({ 
  skill, 
  showProficiency = true,
  variant = 'secondary'
}: SkillTagProps) {
  const proficiencyLevel = getProficiencyLevel(skill.proficiency);
  const proficiencyPercentage = formatSkillProficiency(skill.proficiency);

  return (
    <div className="group relative">
      <Badge 
        variant={variant}
        className="text-sm font-medium px-3 py-1 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default"
      >
        {skill.skill_name}
        {showProficiency && skill.proficiency && (
          <span className="ml-2 text-xs opacity-75">
            {proficiencyPercentage}
          </span>
        )}
      </Badge>
      
      {/* Tooltip on Hover */}
      {showProficiency && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          <div className="text-center">
            <div className="font-medium">{skill.skill_name}</div>
            <div className="text-gray-300">
              {proficiencyLevel} • {proficiencyPercentage}
            </div>
            {skill.years_of_experience && (
              <div className="text-gray-300">
                {skill.years_of_experience} years experience
              </div>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

