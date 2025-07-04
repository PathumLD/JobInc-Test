// components/candidate/profile/section-wrapper.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  title: string;
  editHref?: string;
  addHref?: string;
  children: React.ReactNode;
  showEditButton?: boolean;
  showAddButton?: boolean;
  isEmpty?: boolean;
  sectionId?: string;
  className?: string;
}

export default function SectionWrapper({
  title,
  editHref,
  addHref,
  children,
  showEditButton = true,
  showAddButton = false,
  isEmpty = false,
  sectionId,
  className
}: SectionWrapperProps) {
  return (
    <div 
      id={sectionId}
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Add Button */}
          {showAddButton && addHref && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Link href={addHref}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Link>
            </Button>
          )}
          
          {/* Edit Button */}
          {showEditButton && editHref && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <Link href={editHref}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className={cn(
        "px-6 pb-6",
        isEmpty && "pb-8"
      )}>
        {children}
      </div>
    </div>
  );
}