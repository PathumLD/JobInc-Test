// app/(dashboard)/candidate/profile/display-profile/components/experience-section.tsx
'use client';

import SectionWrapper from '@/components/candidate/profile/section-wrapper';
import EmptySection from '@/components/candidate/profile/empty-section';
import ExperienceCard from '@/components/candidate/profile/experience-card';
import { Briefcase } from 'lucide-react';
import { WorkExperienceDisplayData } from '@/lib/types/candidate/profile/profile-display';

interface ExperienceSectionProps {
  experiences: WorkExperienceDisplayData[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const hasExperiences = experiences && experiences.length > 0;

  if (!hasExperiences) {
    return (
      <SectionWrapper 
        title="Experience"
        editHref="/candidate/profile/edit-profile/experience"
        isEmpty={true}
      >
        <EmptySection
          title="Show your work experience"
          description="Add your professional experience to help recruiters understand your background and career progression."
          addHref="/candidate/profile/edit-profile/experience"
          buttonText="Add experience"
          icon={Briefcase}
        />
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper 
      title="Experience"
      editHref="/candidate/profile/edit-profile/experience"
      addHref="/candidate/profile/edit-profile/experience"
      showAddButton={true}
      sectionId="experience"
    >
      <div className="space-y-0">
        {experiences.map((experience) => (
          <ExperienceCard 
            key={experience.id} 
            experience={experience}
            showEditButton={true}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}