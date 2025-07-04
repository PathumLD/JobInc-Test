// app/(dashboard)/candidate/profile/display-profile/components/certificates-section.tsx
'use client';

import SectionWrapper from '@/components/candidate/profile/section-wrapper';
import EmptySection from '@/components/candidate/profile/empty-section';
import CertificateCard from '@/components/candidate/profile/certificate-card';
import { CertificateDisplayData } from '@/lib/types/profile-display';
import { Award } from 'lucide-react';

interface CertificatesSectionProps {
  certificates: CertificateDisplayData[];
}

export default function CertificatesSection({ certificates }: CertificatesSectionProps) {
  const hasCertificates = certificates && certificates.length > 0;

  if (!hasCertificates) {
    return (
      <SectionWrapper 
        title="Licenses & Certifications"
        editHref="/candidate/profile/edit/certificates"
        isEmpty={true}
      >
        <EmptySection
          title="Add your certifications"
          description="Showcase your professional certifications, licenses, and training to demonstrate your expertise and commitment to learning."
          addHref="/candidate/profile/edit/certificates/add"
          buttonText="Add certification"
          icon={Award}
        />
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper 
      title="Licenses & Certifications"
      editHref="/candidate/profile/edit/certificates"
      addHref="/candidate/profile/edit/certificates/add"
      showAddButton={true}
      sectionId="certificates"
    >
      <div className="grid gap-4">
        {certificates.map((certificate) => (
          <CertificateCard 
            key={certificate.id} 
            certificate={certificate}
            showEditButton={true}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}