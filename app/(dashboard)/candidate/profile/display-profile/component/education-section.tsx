// app/(dashboard)/candidate/profile/display-profile/components/education-section.tsx
'use client';

import SectionWrapper from '@/components/candidate/profile/section-wrapper';
import EmptySection from '@/components/candidate/profile/empty-section';
import EducationCard from '@/components/candidate/profile/education-card';
import { EducationDisplayData } from '@/lib/types/profile-display';
import { GraduationCap } from 'lucide-react';

interface EducationSectionProps {
  education: EducationDisplayData[];
}

export default function EducationSection({ education }: EducationSectionProps) {
  const hasEducation = education && education.length > 0;

  if (!hasEducation) {
    return (
      <SectionWrapper 
        title="Education"
        editHref="/candidate/profile/edit/education"
        isEmpty={true}
      >
        <EmptySection
          title="Add your education"
          description="Share your educational background to showcase your qualifications and academic achievements."
          addHref="/candidate/profile/edit/education/add"
          buttonText="Add education"
          icon={GraduationCap}
        />
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper 
      title="Education"
      editHref="/candidate/profile/edit/education"
      addHref="/candidate/profile/edit/education/add"
      showAddButton={true}
      sectionId="education"
    >
      <div className="space-y-0">
        {education.map((edu) => (
          <EducationCard 
            key={edu.id} 
            education={edu}
            showEditButton={true}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}