// components/candidate/profile/certificate-card.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { CertificateDisplayData } from '@/lib/types/candidate/profile/profile-display';
import { 
  formatProfileDate,
  isCertificateExpired,
  isCertificateExpiringSoon
} from '@/lib/utils/profile-formatters';

interface CertificateCardProps {
  certificate: CertificateDisplayData;
  showEditButton?: boolean;
}

export default function CertificateCard({ 
  certificate, 
  showEditButton = false 
}: CertificateCardProps) {
  const isExpired = isCertificateExpired(certificate.expiry_date);
  const isExpiringSoon = isCertificateExpiringSoon(certificate.expiry_date);
  
  const issueDate = formatProfileDate(certificate.issue_date, 'short');
  const expiryDate = formatProfileDate(certificate.expiry_date, 'short');

  return (
    <div className="group relative border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Certificate Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Award className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Certificate Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="min-w-0 flex-1">
              {/* Certificate Name */}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {certificate.name || 'Certificate Name'}
              </h3>
              
              {/* Issuing Authority */}
              <p className="text-gray-700 font-medium">
                {certificate.issuing_authority || 'Issuing Authority'}
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex flex-col gap-1 ml-4">
              {isExpired && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
              
              {!isExpired && isExpiringSoon && (
                <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expires Soon
                </Badge>
              )}
              
              {showEditButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-auto p-1"
                  asChild
                >
                  <Link href={`/candidate/profile/edit/certificates/${certificate.id}`}>
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-500">
            {certificate.issue_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Issued {issueDate}</span>
              </div>
            )}
            
            {certificate.expiry_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className={isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : ''}>
                  {isExpired ? 'Expired' : 'Expires'} {expiryDate}
                </span>
              </div>
            )}
            
            {!certificate.expiry_date && certificate.issue_date && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                No Expiry
              </Badge>
            )}
          </div>

          {/* Credential Information */}
          <div className="flex flex-wrap gap-2 mb-3">
            {certificate.credential_id && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">ID:</span> {certificate.credential_id}
              </div>
            )}
            
            {certificate.credential_url && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                asChild
              >
                <a href={certificate.credential_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Verify
                </a>
              </Button>
            )}
          </div>

          {/* Description */}
          {certificate.description && (
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {certificate.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

