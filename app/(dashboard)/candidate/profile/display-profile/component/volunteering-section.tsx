// app/(dashboard)/candidate/profile/display-profile/components/volunteering-section.tsx
'use client';

import SectionWrapper from '@/components/candidate/profile/section-wrapper';
import EmptySection from '@/components/candidate/profile/empty-section';
import VolunteerCard from '@/components/candidate/profile/volunteer-card';
import { VolunteeringDisplayData } from '@/lib/types/profile-display';
import { Heart } from 'lucide-react';

interface VolunteeringSectionProps {
  volunteering: VolunteeringDisplayData[];
}

export default function VolunteeringSection({ volunteering }: VolunteeringSectionProps) {
  const hasVolunteering = volunteering && volunteering.length > 0;

  if (!hasVolunteering) {
    return (
      <SectionWrapper 
        title="Volunteering"
        editHref="/candidate/profile/edit/volunteering"
        isEmpty={true}
      >
        <EmptySection
          title="Share your volunteer experience"
          description="Add your volunteer work to show your commitment to causes you care about and demonstrate your community involvement."
          addHref="/candidate/profile/edit/volunteering/add"
          buttonText="Add volunteer experience"
          icon={Heart}
        />
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper 
      title="Volunteering"
      editHref="/candidate/profile/edit/volunteering"
      addHref="/candidate/profile/edit/volunteering/add"
      showAddButton={true}
      sectionId="volunteering"
    >
      <div className="space-y-0">
        {volunteering.map((volunteer) => (
          <VolunteerCard 
            key={volunteer.id} 
            volunteer={volunteer}
            showEditButton={true}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}