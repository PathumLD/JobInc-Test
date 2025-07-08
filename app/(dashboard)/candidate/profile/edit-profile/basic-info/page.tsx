// app/(dashboard)/candidate/profile/edit/basic-info/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Briefcase,
  DollarSign,
  Clock,
  Upload,
  ArrowLeft,
  Save,
  Loader2,
  Camera
} from 'lucide-react';
import { useAuthGuard, getUserFromToken } from '@/app/api/auth/authGuard';
import { BasicInfoFormData } from '@/lib/types/candidate/profile/edit-profile';

export default function BasicInfoEditPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const router = useRouter();

  useAuthGuard('candidate');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<BasicInfoFormData>();

  const watchedValues = watch();

  // Load existing data
  useEffect(() => {
    const loadBasicInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/candidate/profile/display-profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load profile data');
        }

        const result = await response.json();
        if (result.success && result.data) {
          const candidate = result.data.candidate;
          
          // Set form values
          Object.keys(candidate).forEach(key => {
            if (candidate[key] !== null && candidate[key] !== undefined) {
              setValue(key as keyof BasicInfoFormData, candidate[key]);
            }
          });

          // Set profile image preview
          if (candidate.profile_image_url) {
            setProfileImagePreview(candidate.profile_image_url);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading basic info:', error);
        toast.error('Failed to load profile data');
        setIsLoading(false);
      }
    };

    loadBasicInfo();
  }, [setValue, router]);

  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('Image selected. It will be uploaded when you save the form.');
    }
  };

  // Convert file to base64 for sending with form data
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Form submission
  const onSubmit = async (data: BasicInfoFormData) => {
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Prepare form data including image if selected
      const formData = {
        ...data,
        profile_image_file: null as string | null,
        profile_image_filename: null as string | null,
        profile_image_type: null as string | null,
      };

      // Convert image to base64 if selected
      if (profileImage) {
        toast.info('Processing profile image...');
        try {
          const base64Image = await fileToBase64(profileImage);
          formData.profile_image_file = base64Image;
          formData.profile_image_filename = profileImage.name;
          formData.profile_image_type = profileImage.type;
        } catch (error) {
          console.error('Error processing image:', error);
          toast.error('Failed to process profile image');
          // Continue without image
        }
      }

      // Update basic info (including image upload if provided)
      const updateResponse = await fetch('/api/candidate/profile/edit-profile/basic-info', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!updateResponse.ok) {
        const errorResult = await updateResponse.json();
        throw new Error(errorResult.details?.join(', ') || 'Failed to update basic info');
      }

      const result = await updateResponse.json();
      if (result.success) {
        toast.success('Basic information updated successfully!');
        router.push('/candidate/profile/display-profile');
      } else {
        throw new Error(result.error || 'Update failed');
      }

    } catch (error) {
      console.error('Error updating basic info:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update basic information');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading basic information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Basic Information</h1>
                <p className="text-gray-600">Update your personal and professional details</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Profile Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImagePreview} />
                    <AvatarFallback className="text-lg">
                      {`${watchedValues.first_name?.[0] || ''}${watchedValues.last_name?.[0] || ''}`}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <Label htmlFor="profile-image" className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                        <Upload className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload profile image
                        </span>
                      </div>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: JPG, PNG, GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    {...register('first_name', { required: 'First name is required' })}
                    placeholder="Enter your first name"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    {...register('last_name', { required: 'Last name is required' })}
                    placeholder="Enter your last name"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="additional_name">Additional Name</Label>
                  <Input
                    id="additional_name"
                    {...register('additional_name')}
                    placeholder="Middle name or other names"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setValue('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register('date_of_birth')}
                  />
                </div>

                <div>
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <Input
                    id="pronouns"
                    {...register('pronouns')}
                    placeholder="e.g., he/him, she/her, they/them"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <Label htmlFor="current_position">Current Position</Label>
                  <Input
                    id="current_position"
                    {...register('current_position')}
                    placeholder="Your current job title"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    {...register('industry')}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...register('bio')}
                    placeholder="A brief description about yourself"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="professional_summary">Professional Summary</Label>
                  <Textarea
                    id="professional_summary"
                    {...register('professional_summary')}
                    placeholder="Detailed professional summary"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...register('country')}
                    placeholder="Enter your country"
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="Enter your city"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="City, Country or specific location"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    {...register('address')}
                    placeholder="Complete address"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone1">Primary Phone</Label>
                  <Input
                    id="phone1"
                    {...register('phone1')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="phone2">Secondary Phone</Label>
                  <Input
                    id="phone2"
                    {...register('phone2')}
                    placeholder="+1 (555) 987-6543"
                  />
                </div>

                <div>
                  <Label htmlFor="personal_website">Personal Website</Label>
                  <Input
                    id="personal_website"
                    {...register('personal_website')}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio_url">Portfolio URL</Label>
                  <Input
                    id="portfolio_url"
                    {...register('portfolio_url')}
                    placeholder="https://portfolio.com"
                  />
                </div>

                <div>
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    {...register('github_url')}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    {...register('linkedin_url')}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Experience & Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Experience & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select onValueChange={(value) => setValue('experience_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="years_of_experience">Years of Experience</Label>
                  <Input
                    id="years_of_experience"
                    type="number"
                    min="0"
                    max="50"
                    {...register('years_of_experience', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="availability_status">Availability Status</Label>
                  <Select onValueChange={(value) => setValue('availability_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="open_to_opportunities">Open to opportunities</SelectItem>
                      <SelectItem value="not_looking">Not looking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="availability_date">Available From</Label>
                  <Input
                    id="availability_date"
                    type="date"
                    {...register('availability_date')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Work Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="remote_preference">Remote Preference</Label>
                  <Select onValueChange={(value) => setValue('remote_preference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select remote preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote_only">Remote Only</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="work_availability">Work Availability</Label>
                  <Select onValueChange={(value) => setValue('work_availability', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notice_period">Notice Period (days)</Label>
                  <Input
                    id="notice_period"
                    type="number"
                    min="0"
                    max="365"
                    {...register('notice_period', { valueAsNumber: true })}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="open_to_relocation"
                      onCheckedChange={(checked) => setValue('open_to_relocation', !!checked)}
                    />
                    <Label htmlFor="open_to_relocation">Open to relocation</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="willing_to_travel"
                      onCheckedChange={(checked) => setValue('willing_to_travel', !!checked)}
                    />
                    <Label htmlFor="willing_to_travel">Willing to travel</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary & Compensation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Salary & Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expected_salary_min">Minimum Expected Salary</Label>
                  <Input
                    id="expected_salary_min"
                    type="number"
                    min="0"
                    {...register('expected_salary_min', { valueAsNumber: true })}
                    placeholder="50000"
                  />
                </div>

                <div>
                  <Label htmlFor="expected_salary_max">Maximum Expected Salary</Label>
                  <Input
                    id="expected_salary_max"
                    type="number"
                    min="0"
                    {...register('expected_salary_max', { valueAsNumber: true })}
                    placeholder="80000"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select onValueChange={(value) => setValue('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="LKR">LKR</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-3">
                  <Label htmlFor="salary_visibility">Salary Visibility</Label>
                  <Select onValueChange={(value) => setValue('salary_visibility', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salary visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="range_only">Range Only</SelectItem>
                      <SelectItem value="exact">Exact</SelectItem>
                      <SelectItem value="negotiable">Negotiable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nic">National ID/NIC</Label>
                  <Input
                    id="nic"
                    {...register('nic')}
                    placeholder="Enter your NIC number"
                  />
                </div>

                <div>
                  <Label htmlFor="passport">Passport Number</Label>
                  <Input
                    id="passport"
                    {...register('passport')}
                    placeholder="Enter passport number"
                  />
                </div>

                <div>
                  <Label htmlFor="work_authorization">Work Authorization</Label>
                  <Select onValueChange={(value) => setValue('work_authorization', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work authorization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="permanent_resident">Permanent Resident</SelectItem>
                      <SelectItem value="work_visa">Work Visa</SelectItem>
                      <SelectItem value="requires_sponsorship">Requires Sponsorship</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visa_assistance_needed"
                      onCheckedChange={(checked) => setValue('visa_assistance_needed', !!checked)}
                    />
                    <Label htmlFor="visa_assistance_needed">Visa assistance needed</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="security_clearance"
                      onCheckedChange={(checked) => setValue('security_clearance', !!checked)}
                    />
                    <Label htmlFor="security_clearance">Security clearance</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interview_ready"
                      onCheckedChange={(checked) => setValue('interview_ready', !!checked)}
                    />
                    <Label htmlFor="interview_ready">Interview ready</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pre_qualified"
                      onCheckedChange={(checked) => setValue('pre_qualified', !!checked)}
                    />
                    <Label htmlFor="pre_qualified">Pre-qualified</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}