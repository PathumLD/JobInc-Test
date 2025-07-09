// app/(dashboard)/candidate/profile/display-profile/components/profile-header.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Phone,
  Mail, 
  Globe, 
  Github, 
  Linkedin,
  Camera,
  ExternalLink,
  Upload,
  Trash2,
  Loader2
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
  onImageUpdate?: (newImageUrl: string | null) => void;
}

export default function ProfileHeader({ candidate, userEmail, onImageUpdate }: ProfileHeaderProps) {
  const fullName = generateFullName(candidate.first_name, candidate.last_name, candidate.additional_name);
  const initials = generateInitials(candidate.first_name, candidate.last_name);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(candidate.profile_image_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when candidate prop changes
  useEffect(() => {
    setCurrentImageUrl(candidate.profile_image_url);
  }, [candidate.profile_image_url]);

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Invalid file type. Please select an image file.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Please select an image smaller than 5MB.');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Upload image to server
  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        alert('Authentication required. Please log in to upload an image.');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/candidate/profile/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image');
      }

      // Update the image URL
      const newImageUrl = result.data.image_url;
      setCurrentImageUrl(newImageUrl);
      onImageUpdate?.(newImageUrl);
      
      // Clean up preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setIsDialogOpen(false);

      alert('Profile image updated successfully!');

    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message || 'Failed to upload image. Please try again.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete current image
  const handleDelete = async () => {
    if (!currentImageUrl) return;

    setIsDeleting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        alert('Authentication required. Please log in to delete the image.');
        return;
      }

      const response = await fetch('/api/candidate/profile/upload-profile-image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete image');
      }

      // Update the image URL to null
      setCurrentImageUrl(null);
      onImageUpdate?.(null);
      setIsDialogOpen(false);

      alert('Profile image deleted successfully!');

    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Delete failed: ${error.message || 'Failed to delete image. Please try again.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel and clean up
  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Cover Photo Background */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
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
          {/* Profile Picture with Inline Upload */}
          <div className="relative mb-4 sm:mb-0">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage 
                src={currentImageUrl || ""} 
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-semibold bg-gray-100">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Edit Photo Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full bg-white shadow-md hover:bg-gray-50 border border-gray-200"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Current/Preview Image */}
                  <div className="flex justify-center">
                    <Avatar className="h-32 w-32">
                      <AvatarImage 
                        src={previewUrl || currentImageUrl || ""} 
                        alt={fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl font-semibold bg-gray-100">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* File Input */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isDeleting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose New Image
                    </Button>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      JPG, PNG, GIF or WebP. Max file size 5MB.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {previewUrl ? (
                      <>
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading || isDeleting}
                          className="flex-1"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isUploading || isDeleting}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        {currentImageUrl && (
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isUploading || isDeleting}
                            className="flex-1"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Image
                              </>
                            )}
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={isUploading || isDeleting}
                          className={currentImageUrl ? "flex-1" : "w-full"}
                        >
                          Close
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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