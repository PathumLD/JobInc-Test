// app/(dashboard)/candidate/profile/display-profile/components/projects-section.tsx
'use client';

import SectionWrapper from '@/components/candidate/profile/section-wrapper';
import EmptySection from '@/components/candidate/profile/empty-section';
import ProjectCard from '@/components/candidate/profile/project-card';
import { ProjectDisplayData } from '@/lib/types/candidate/profile/profile-display';
import { Folder } from 'lucide-react';

interface ProjectsSectionProps {
  projects: ProjectDisplayData[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const hasProjects = projects && projects.length > 0;

  if (!hasProjects) {
    return (
      <SectionWrapper 
        title="Projects"
        editHref="/candidate/profile/edit/projects"
        isEmpty={true}
      >
        <EmptySection
          title="Showcase your projects"
          description="Highlight your best work and personal projects to demonstrate your skills and creativity to potential employers."
          addHref="/candidate/profile/edit/projects/add"
          buttonText="Add project"
          icon={Folder}
        />
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper 
      title="Projects"
      editHref="/candidate/profile/edit/projects"
      addHref="/candidate/profile/edit/projects/add"
      showAddButton={true}
      sectionId="projects"
    >
      <div className="space-y-0">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project}
            showEditButton={true}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}