// app/(dashboard)/candidate/profile/display-profile/components/awards-section.tsx
'use client';

import SectionWrapper from '@/components/candidate/profile/section-wrapper';
import EmptySection from '@/components/candidate/profile/empty-section';
import AwardItem from '@/components/candidate/profile/award-item';
import { AwardDisplayData } from '@/lib/types/candidate/profile/profile-display';
import { Trophy } from 'lucide-react';

interface AwardsSectionProps {
  awards: AwardDisplayData[];
}

export default function AwardsSection({ awards }: AwardsSectionProps) {
  const hasAwards = awards && awards.length > 0;

  if (!hasAwards) {
    return (
      <SectionWrapper 
        title="Honors & Awards"
        // editHref="/candidate/profile/edit/awards"
        isEmpty={true}
      >
        <EmptySection
          title="Highlight your achievements"
          description="Add awards, honors, and recognitions you've received to showcase your accomplishments and excellence."
          addHref="/candidate/profile/edit/awards/add"
          buttonText="Add award"
          icon={Trophy}
        />
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper 
      title="Honors & Awards"
      editHref="/candidate/profile/edit/awards"
      addHref="/candidate/profile/edit/awards/add"
      showAddButton={true}
      sectionId="awards"
    >
      <div className="space-y-0">
        {awards.map((award) => (
          <AwardItem 
            key={award.id} 
            award={award}
            showEditButton={true}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}