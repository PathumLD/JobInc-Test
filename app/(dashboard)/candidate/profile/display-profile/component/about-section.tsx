// app/(dashboard)/candidate/profile/display-profile/components/about-section.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SectionWrapper from '@/components/candidate/profile/section-wrapper';
import EmptySection from '@/components/candidate/profile/empty-section';
import { FileText } from 'lucide-react';

interface AboutSectionProps {
  content: string | null;
  onEdit?: () => void;
}

export default function AboutSection({ content, onEdit }: AboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = content && content.length > 300;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.substring(0, 300) + '...' 
    : content;

  if (!content || content.trim().length === 0) {
    return (
      <SectionWrapper 
        title="About"
        editHref="/candidate/profile/edit/about"
        isEmpty={true}
      >
        <EmptySection
          title="Share your story"
          description="Write a brief introduction about yourself, your experience, and what you're passionate about. This helps recruiters and employers understand who you are."
          addHref="/candidate/profile/edit/about"
          buttonText="Add about section"
          icon={FileText}
        />
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper 
      title="About"
      editHref="/candidate/profile/edit/about"
      sectionId="about"
    >
      <div className="space-y-4">
        {/* About Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
        </div>

        {/* Show More/Less Button */}
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-medium"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
        )}

        {/* Character Count (for reference) */}
        {content && content.length > 50 && (
          <div className="text-xs text-gray-500 border-t pt-3 mt-4">
            {content.length} characters
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}