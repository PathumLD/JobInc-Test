// app/(dashboard)/candidate/profile/display-profile/components/profile-header.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Phone,
  Mail, 
  Globe, 
  Github, 
  Linkedin,
  Camera,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { CandidateDisplayData } from '@/lib/types/candidate/profile/profile-display';
import { 
  generateInitials, 
  generateFullName, 
  formatAvailabilityStatus,
  formatYearsOfExperience 
} from '@/lib/utils/profile-formatters';

interface ProfileHeaderProps {
  candidate: CandidateDisplayData;
  userEmail?: string;
}

export default function ProfileHeader({ candidate, userEmail }: ProfileHeaderProps) {
  const fullName = generateFullName(candidate.first_name, candidate.last_name, candidate.additional_name);
  const initials = generateInitials(candidate.first_name, candidate.last_name);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Cover Photo Background */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        {/* Edit Cover Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          asChild
        >
          <Link href="/candidate/profile/edit/basic-info">
            <Camera className="h-4 w-4 mr-1" />
            Edit cover
          </Link>
        </Button>
      </div>

      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Profile Picture and Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 relative">
          {/* Profile Picture */}
          <div className="relative mb-4 sm:mb-0">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={""} alt={fullName} />
              <AvatarFallback className="text-2xl font-semibold bg-gray-100">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Edit Photo Overlay */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full bg-white shadow-md hover:bg-gray-50"
              asChild
            >
              <Link href="/candidate/profile/edit/basic-info">
                <Camera className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Name and Title */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {fullName}
                </h1>
                
                {candidate.title && (
                  <p className="text-lg text-gray-700 mt-1">
                    {candidate.title}
                  </p>
                )}
                
                {candidate.current_position && (
                  <p className="text-gray-600 mt-1">
                    {candidate.current_position}
                  </p>
                )}

                {/* Location and Experience */}
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                  {candidate.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {candidate.location}
                    </div>
                  )}
                  
                  {candidate.years_of_experience && candidate.years_of_experience > 0 && (
                    <div>
                      {formatYearsOfExperience(candidate.years_of_experience)} experience
                    </div>
                  )}
                </div>
              </div>

              {/* Availability Status */}
              <div className="mt-4 sm:mt-0 sm:ml-4">
                {candidate.availability_status && (
                  <Badge 
                    variant={candidate.availability_status === 'available' ? 'default' : 'secondary'}
                    className={
                      candidate.availability_status === 'available' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                    }
                  >
                    {formatAvailabilityStatus(candidate.availability_status)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Email */}
            {userEmail && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <a 
                  href={`mailto:${userEmail}`}
                  className="hover:text-blue-600 truncate"
                >
                  {userEmail}
                </a>
              </div>
            )}

            {/* Phone1 */}
            {candidate.phone1 && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <a 
                  href={`tel:${candidate.phone1}`}
                  className="hover:text-blue-600"
                >
                  {candidate.phone1}
                </a>
              </div>
            )}

            {/* Phone2 */}
            {candidate.phone2 && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <a 
                  href={`tel:${candidate.phone2}`}
                  className="hover:text-blue-600"
                >
                  {candidate.phone2}
                </a>
              </div>
            )}

            {/* Website */}
            {candidate.personal_website && (
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                <a 
                  href={candidate.personal_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 truncate flex items-center"
                >
                  Website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}

            {/* LinkedIn */}
            {candidate.linkedin_url && (
              <div className="flex items-center text-sm text-gray-600">
                <Linkedin className="h-4 w-4 mr-2 text-gray-400" />
                <a 
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 truncate flex items-center"
                >
                  LinkedIn
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}

            {/* GitHub */}
            {candidate.github_url && (
              <div className="flex items-center text-sm text-gray-600">
                <Github className="h-4 w-4 mr-2 text-gray-400" />
                <a 
                  href={candidate.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 truncate flex items-center"
                >
                  GitHub
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}

            {/* Portfolio */}
            {candidate.portfolio_url && (
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                <a 
                  href={candidate.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 truncate flex items-center"
                >
                  Portfolio
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Profile Summary/Bio */}
        {candidate.bio && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              {candidate.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}