// components/candidate/profile/award-item.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Trophy, Calendar } from 'lucide-react';
import Link from 'next/link';
import { AwardDisplayData } from '@/lib/types/profile-display';
import { formatProfileDate } from '@/lib/utils/profile-formatters';

interface AwardItemProps {
  award: AwardDisplayData;
  showEditButton?: boolean;
}

export default function AwardItem({ 
  award, 
  showEditButton = false 
}: AwardItemProps) {
  const awardDate = formatProfileDate(award.date, 'long');

  return (
    <div className="group relative border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0">
      <div className="flex gap-4">
        {/* Award Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-600" />
          </div>
        </div>

        {/* Award Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              {/* Award Title */}
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {award.title || 'Award Title'}
              </h3>
              
              {/* Offered By */}
              <p className="text-sm text-gray-700 font-medium">
                {award.offered_by || 'Awarding Organization'}
              </p>
              
              {/* Associated With */}
              {award.associated_with && (
                <p className="text-sm text-gray-600">
                  Associated with {award.associated_with}
                </p>
              )}
              
              {/* Date */}
              {award.date && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{awardDate}</span>
                </div>
              )}
            </div>

            {/* Edit Button */}
            {showEditButton && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                asChild
              >
                <Link href={`/candidate/profile/edit/awards/${award.id}`}>
                  Edit
                </Link>
              </Button>
            )}
          </div>

          {/* Description */}
          {award.description && (
            <div className="mt-2">
              <p className="text-sm text-gray-700 leading-relaxed">
                {award.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

