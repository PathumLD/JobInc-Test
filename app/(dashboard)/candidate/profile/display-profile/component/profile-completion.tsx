// app/(dashboard)/candidate/profile/display-profile/components/profile-completion.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { ProfileStatsData } from '@/lib/types/profile-display';

interface ProfileCompletionProps {
  stats: ProfileStatsData;
}

export default function ProfileCompletion({ stats }: ProfileCompletionProps) {
  const { 
    completion_percentage, 
    missing_sections, 
    recommendations 
  } = stats;

  // Don't show if profile is highly complete
  if (completion_percentage >= 95) {
    return null;
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Profile Strength
              </h3>
              <p className="text-sm text-gray-600">
                Improve your visibility to employers
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${getCompletionColor(completion_percentage)}`}>
              {completion_percentage}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={completion_percentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Keep building your profile</span>
            <span>{100 - completion_percentage}% to go</span>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
              Recommended next steps
            </h4>
            
            <div className="space-y-2">
              {recommendations.slice(0, 3).map((recommendation, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      {recommendation}
                    </span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-auto p-1"
                    asChild
                  >
                    <Link href={getRecommendationLink(recommendation)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Sections */}
        {missing_sections && missing_sections.length > 0 && (
          <div className="pt-4 border-t border-blue-200">
            <div className="text-xs text-gray-600">
              <strong>Missing sections:</strong> {missing_sections.join(', ')}
            </div>
          </div>
        )}

        {/* Profile Stats Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-200 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.work_experience_count}
            </div>
            <div className="text-xs text-gray-500">Experiences</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.skills_count}
            </div>
            <div className="text-xs text-gray-500">Skills</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.projects_count}
            </div>
            <div className="text-xs text-gray-500">Projects</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to map recommendations to links
function getRecommendationLink(recommendation: string): string {
  const lowerRec = recommendation.toLowerCase();
  
  if (lowerRec.includes('summary') || lowerRec.includes('about')) {
    return '/candidate/profile/edit/about';
  }
  if (lowerRec.includes('experience')) {
    return '/candidate/profile/edit/experience/add';
  }
  if (lowerRec.includes('education')) {
    return '/candidate/profile/edit/education/add';
  }
  if (lowerRec.includes('skills')) {
    return '/candidate/profile/edit/skills';
  }
  if (lowerRec.includes('projects')) {
    return '/candidate/profile/edit/projects/add';
  }
  if (lowerRec.includes('resume') || lowerRec.includes('cv')) {
    return '/candidate/profile/create-profile'; // CV upload section
  }
  
  return '/candidate/profile/edit/basic-info';
}