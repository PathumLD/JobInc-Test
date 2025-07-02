// app/profile/create-profile/CertificateForm.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { BasicInfoFormValues } from './BasicInfoForm';
import { useEffect, useState } from 'react';

interface Certificate {
  name: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  media_url?: string;
}

export default function CertificateForm({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const { watch, setValue, getValues } = useFormContext<BasicInfoFormValues>();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const certificates = watch('certificates') || [];

  // Initialize certificates if none exist
  useEffect(() => {
    if (!isInitialized) {
      const currentCertificates = getValues('certificates');
      console.log('🔍 CertificateForm - Current certificates on mount:', currentCertificates);
      
      // Only initialize if truly empty (no extracted data)
      if (!currentCertificates || currentCertificates.length === 0) {
        console.log('📝 Initializing empty certificate form');
        setValue('certificates', [
          {
            name: '',
            issuing_authority: '',
            issue_date: '',
            expiry_date: '',
            credential_id: '',
            credential_url: '',
            description: '',
            media_url: '',
          },
        ]);
      } else {
        console.log('✅ Using extracted certificate data:', currentCertificates.length, 'certificates');
      }
      setIsInitialized(true);
    }
  }, [isInitialized, setValue, getValues]);

  // Debug: Log when certificates change
  useEffect(() => {
    console.log('📋 Certificates updated in form:', certificates.length, certificates);
  }, [certificates]);

  const addNewCertificate = () => {
    setValue('certificates', [
      ...certificates,
      {
        name: '',
        issuing_authority: '',
        issue_date: '',
        expiry_date: '',
        credential_id: '',
        credential_url: '',
        description: '',
        media_url: '',
      },
    ]);
  };

  const removeCertificate = (index: number) => {
    if (certificates.length <= 1) {
      // Don't remove the last certificate, just clear it
      setValue('certificates', [
        {
          name: '',
          issuing_authority: '',
          issue_date: '',
          expiry_date: '',
          credential_id: '',
          credential_url: '',
          description: '',
          media_url: '',
        },
      ]);
    } else {
      const updatedCertificates = [...certificates];
      updatedCertificates.splice(index, 1);
      setValue('certificates', updatedCertificates);
    }
  };

  const handleCertificateChange = (
    index: number,
    field: keyof Certificate,
    value: string
  ) => {
    const updatedCertificates = [...certificates];
    updatedCertificates[index] = {
      ...updatedCertificates[index],
      [field]: value
    };
    setValue('certificates', updatedCertificates, { shouldDirty: true });
  };

  // Validate form data
  const validateCertificates = () => {
    const validCertificates = certificates.filter(cert => 
      cert.name && cert.name.trim() !== '' && 
      cert.issuing_authority && cert.issuing_authority.trim() !== '' &&
      cert.issue_date && cert.issue_date.trim() !== ''
    );
    
    if (validCertificates.length === 0) {
      // Allow proceeding even with no certificates
      return true;
    }
    
    // Check if any certificate has required fields filled
    for (const cert of certificates) {
      if (cert.name && cert.name.trim() !== '') {
        if (!cert.issuing_authority || cert.issuing_authority.trim() === '') {
          alert('Please fill in the issuing authority for all certificates with names.');
          return false;
        }
        if (!cert.issue_date || cert.issue_date.trim() === '') {
          alert('Please fill in the issue date for all certificates with names.');
          return false;
        }
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateCertificates()) {
      onNext();
    }
  };

  // Don't render until initialized to prevent flashing
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Certificates</h2>
        <p className="text-muted-foreground">
          Add your professional certifications, licenses, and credentials that demonstrate your expertise.
        </p>
        <p className="text-sm text-blue-600">
          You have {certificates.length} certificate(s). You can skip this section if you have no certificates.
        </p>
      </div>

      <div className="space-y-8">
        {certificates.map((certificate, index) => (
          <div key={index} className="space-y-4 p-6 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Certificate #{index + 1}</h3>
              {certificates.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertificate(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`name-${index}`} className="required">
                  Certificate Name *
                </Label>
                <Input
                  id={`name-${index}`}
                  value={certificate.name || ''}
                  onChange={(e) =>
                    handleCertificateChange(index, 'name', e.target.value)
                  }
                  placeholder="e.g., AWS Certified Solutions Architect"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`issuing-authority-${index}`} className="required">
                  Issuing Authority *
                </Label>
                <Input
                  id={`issuing-authority-${index}`}
                  value={certificate.issuing_authority || ''}
                  onChange={(e) =>
                    handleCertificateChange(index, 'issuing_authority', e.target.value)
                  }
                  placeholder="e.g., Amazon Web Services"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`issue-date-${index}`} className="required">
                  Issue Date *
                </Label>
                <Input
                  id={`issue-date-${index}`}
                  type="date"
                  value={certificate.issue_date || ''}
                  onChange={(e) =>
                    handleCertificateChange(index, 'issue_date', e.target.value)
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`expiry-date-${index}`}>
                  Expiry Date
                </Label>
                <Input
                  id={`expiry-date-${index}`}
                  type="date"
                  value={certificate.expiry_date || ''}
                  onChange={(e) =>
                    handleCertificateChange(index, 'expiry_date', e.target.value)
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty if certificate doesn't expire
                </p>
              </div>

              <div>
                <Label htmlFor={`credential-id-${index}`}>
                  Credential ID
                </Label>
                <Input
                  id={`credential-id-${index}`}
                  value={certificate.credential_id || ''}
                  onChange={(e) =>
                    handleCertificateChange(index, 'credential_id', e.target.value)
                  }
                  placeholder="e.g., AWS-ASA-12345"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`credential-url-${index}`}>
                  Credential URL
                </Label>
                <Input
                  id={`credential-url-${index}`}
                  type="url"
                  value={certificate.credential_url || ''}
                  onChange={(e) =>
                    handleCertificateChange(index, 'credential_url', e.target.value)
                  }
                  placeholder="https://aws.amazon.com/certification/verify"
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor={`description-${index}`}>
                  Description
                </Label>
                <Textarea
                  id={`description-${index}`}
                  value={certificate.description || ''}
                  onChange={(e) =>
                    handleCertificateChange(index, 'description', e.target.value)
                  }
                  placeholder="Brief description of what this certification covers..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor={`media-url-${index}`}>
                  Certificate Image/Document URL
                </Label>
                <Input
                  id={`media-url-${index}`}
                  type="url"
                  value={certificate.media_url || ''}
                  onChange={(e) =>
                    handleCertificateChange(index, 'media_url', e.target.value)
                  }
                  placeholder="Link to certificate image or document"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addNewCertificate}
          className="w-full py-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Certificate
        </Button>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="secondary" onClick={onBack}>
          ← Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Save & Continue →
        </Button>
      </div>
    </div>
  );
}