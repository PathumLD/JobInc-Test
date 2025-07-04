// components/candidate/profile/project-card.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, Calendar, ExternalLink, Github, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { ProjectDisplayData } from '@/lib/types/profile-display';
import { 
  formatDateRange, 
  calculateDuration 
} from '@/lib/utils/profile-formatters';

interface ProjectCardProps {
  project: ProjectDisplayData;
  showEditButton?: boolean;
}

export default function ProjectCard({ 
  project, 
  showEditButton = false 
}: ProjectCardProps) {
  const dateRange = {
    start: project.start_date,
    end: project.end_date,
    is_current: project.is_current
  };
  
  const duration = calculateDuration(dateRange);
  const formattedDateRange = formatDateRange(dateRange);

  return (
    <div className="group relative border-b border-gray-100 last:border-b-0 pb-6 last:pb-0 mb-6 last:mb-0">
      <div className="flex gap-4">
        {/* Project Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Folder className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        {/* Project Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              {/* Project Name */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {project.name || 'Project Name'}
                </h3>
                
                {/* Confidential Badge */}
                {project.is_confidential && (
                  <Badge variant="outline" className="text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Confidential
                  </Badge>
                )}
                
                {/* Current Badge */}
                {project.is_current && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Current
                  </Badge>
                )}
              </div>
              
              {/* Role */}
              {project.role && (
                <p className="text-gray-700 font-medium mb-1">
                  {project.role}
                </p>
              )}
              
              {/* Date Range */}
              <div className="flex items-center gap-1 mb-2 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formattedDateRange}</span>
                {duration.formatted && (
                  <>
                    <span>•</span>
                    <span>{duration.formatted}</span>
                  </>
                )}
              </div>

              {/* Project Links */}
              <div className="flex flex-wrap gap-2 mb-3">
                {project.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    asChild
                  >
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Live Demo
                    </a>
                  </Button>
                )}
                
                {project.repository_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    asChild
                  >
                    <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-3 w-3 mr-1" />
                      Code
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Edit Button */}
            {showEditButton && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                asChild
              >
                <Link href={`/candidate/profile/edit/projects/${project.id}`}>
                  Edit
                </Link>
              </Button>
            )}
          </div>

          {/* Description */}
          {project.description && (
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {project.description}
              </p>
            </div>
          )}

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-900 mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((tech, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="text-xs bg-blue-100 text-blue-800"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {project.tools && project.tools.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-900 mb-2">Tools & Platforms</h4>
              <div className="flex flex-wrap gap-1">
                {project.tools.map((tool, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="text-xs"
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {project.responsibilities && project.responsibilities.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-900 mb-2">Key Responsibilities</h4>
              <ul className="space-y-1">
                {project.responsibilities.slice(0, 3).map((responsibility, index) => (
                  <li 
                    key={index} 
                    className="text-xs text-gray-700 flex items-start"
                  >
                    <span className="text-gray-400 mr-2 mt-0.5">•</span>
                    <span>{responsibility}</span>
                  </li>
                ))}
                {project.responsibilities.length > 3 && (
                  <li className="text-xs text-gray-500 italic">
                    +{project.responsibilities.length - 3} more responsibilities
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Skills Gained */}
          {project.skills_gained && project.skills_gained.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-2">Skills Gained</h4>
              <div className="flex flex-wrap gap-1">
                {project.skills_gained.slice(0, 5).map((skill, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="text-xs bg-green-100 text-green-800"
                  >
                    {skill}
                  </Badge>
                ))}
                {project.skills_gained.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.skills_gained.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

