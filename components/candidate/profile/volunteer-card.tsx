// components/candidate/profile/volunteer-card.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { VolunteeringDisplayData } from '@/lib/types/profile-display';
import { 
  formatDateRange, 
  calculateDuration 
} from '@/lib/utils/profile-formatters';

interface VolunteerCardProps {
  volunteer: VolunteeringDisplayData;
  showEditButton?: boolean;
}

export default function VolunteerCard({ 
  volunteer, 
  showEditButton = false 
}: VolunteerCardProps) {
  const dateRange = {
    start: volunteer.start_date,
    end: volunteer.end_date,
    is_current: volunteer.is_current
  };
  
  const duration = calculateDuration(dateRange);
  const formattedDateRange = formatDateRange(dateRange);

  return (
    <div className="group relative border-b border-gray-100 last:border-b-0 pb-6 last:pb-0 mb-6 last:mb-0">
      <div className="flex gap-4">
        {/* Volunteer Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
        </div>

        {/* Volunteer Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              {/* Role */}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {volunteer.role || 'Volunteer Role'}
              </h3>
              
              {/* Institution */}
              <p className="text-gray-700 font-medium">
                {volunteer.institution || 'Organization Name'}
              </p>
              
              {/* Cause */}
              {volunteer.cause && (
                <p className="text-gray-600 text-sm mt-1">
                  {volunteer.cause}
                </p>
              )}
              
              {/* Duration */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                {duration.formatted && (
                  <span>{duration.formatted}</span>
                )}
              </div>
              
              {/* Date Range */}
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formattedDateRange}</span>
              </div>
              
              {/* Current Badge */}
              {volunteer.is_current && (
                <Badge 
                  variant="secondary" 
                  className="mt-2 bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Current
                </Badge>
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
                <Link href={`/candidate/profile/edit/volunteering/${volunteer.id}`}>
                  Edit
                </Link>
              </Button>
            )}
          </div>

          {/* Description */}
          {volunteer.description && (
            <div className="mt-3">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {volunteer.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

