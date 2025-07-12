import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Building2, Clock, Briefcase } from "lucide-react";

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  postedAt: string;
};

export default function JobCard({ job }: { job: Job }) {
  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'part-time':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contract':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'remote':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {job.title}
          </h3>
          
          {/* Company and Location */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>
        
        {/* Job Type Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeColor(job.type)}`}>
          {job.type}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Posted Date */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatDate(job.postedAt)}</span>
        </div>

        {/* Apply Button */}
        <Link href={`/job/${job.id}`}>
          <Button 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
        </Link>
      </div>
    </div>
  );
}